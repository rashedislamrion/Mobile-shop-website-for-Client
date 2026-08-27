export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

let inMemoryToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('novamobile_access_token') : null;
let unauthorizedListeners: Array<() => void> = [];

export function getAccessToken(): string | null {
  if (!inMemoryToken && typeof window !== 'undefined') {
    inMemoryToken = localStorage.getItem('novamobile_access_token');
  }
  return inMemoryToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('novamobile_access_token', token);
    } else {
      localStorage.removeItem('novamobile_access_token');
    }
  }
}

export function onUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.push(listener);
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter((l) => l !== listener);
  };
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in unauthorized listener', e);
    }
  });
}

export function getImageUrl(path?: string | null, fallback = '/images/placeholder.png'): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${BACKEND_URL}${path}`;
  if (path.startsWith('uploads/')) return `${BACKEND_URL}/${path}`;
  return path;
}

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        setAccessToken(null);
        notifyUnauthorized();
        return null;
      }

      const data = await res.json();
      const newToken = data.accessToken;
      if (newToken) {
        setAccessToken(newToken);
        return newToken;
      }
      return null;
    } catch {
      setAccessToken(null);
      notifyUnauthorized();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    ...(typeof window !== 'undefined' ? { credentials: options.credentials || 'include' } : {}),
  };

  try {
    const response = await fetch(url, config);

    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes("login") &&
      !endpoint.includes("refresh") &&
      !endpoint.includes("register")
    ) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        return apiFetch<T>(endpoint, { ...options, headers }, true);
      }
    }

    if (!response.ok) {
      let errorBody: any = {};
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }

      const message =
        Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message || errorBody.error || `HTTP error ${response.status}`;

      throw new ApiError(message, response.status, errorBody);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError((error as Error).message || 'Network request failed', 0);
  }
}

export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, any>,
  options?: RequestInit,
): Promise<T> {
  const qs = buildQueryString(params);
  return apiFetch<T>(`${endpoint}${qs}`, { ...options, method: 'GET' });
}

export async function apiPost<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit,
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const body = isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined;

  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit,
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const body = isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined;

  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body,
  });
}

export async function apiDelete<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}
