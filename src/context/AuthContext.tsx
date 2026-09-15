"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  apiGet,
  apiPost,
  getCustomerToken,
  setCustomerToken,
  getStaffToken,
  setStaffToken,
  onCustomerUnauthorized,
  onStaffUnauthorized,
  onUnauthorized,
} from "@/lib/api-client";

export interface UserRole {
  id: string;
  name: string;
  scope?: string;
  permissions?: Array<{
    id: string;
    module: string;
    action: string;
    allowed: boolean;
  }>;
}

export interface UserBranch {
  id: string;
  name: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  avatar?: string;
  userType: "STAFF" | "CUSTOMER";
  roleId?: string;
  role?: UserRole;
  branchId?: string;
  branch?: UserBranch;
  permissions?: Array<{
    module: string;
    action: string;
    allowed: boolean;
  }>;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  customerName: string;
  login: (credentials: { emailOrPhone: string; password: string; email?: string }, isStaff?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
}

export const CUSTOMER_USER_KEY = "novamobile_customer_user";
export const STAFF_USER_KEY = "novamobile_staff_user";

// 1. CUSTOMER AUTH CONTEXT
const CustomerAuthContext = createContext<AuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CUSTOMER_USER_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getCustomerToken();
      if (!token) {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem(CUSTOMER_USER_KEY);
        return null;
      }
      const profile = await apiGet<AuthUser>("/auth/me", undefined, { authScope: "CUSTOMER" });
      if (profile && profile.userType === "CUSTOMER") {
        setUser(profile);
        if (typeof window !== "undefined") {
          localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(profile));
        }
        return profile;
      } else {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem(CUSTOMER_USER_KEY);
        return null;
      }
    } catch {
      setUser(null);
      if (typeof window !== "undefined") localStorage.removeItem(CUSTOMER_USER_KEY);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getCustomerToken();
        if (token) {
          const profile = await fetchCurrentUser();
          if (!profile) {
            const res = await apiPost<{ accessToken: string }>("/auth/customer/refresh", undefined, { authScope: "CUSTOMER" });
            if (res?.accessToken) {
              setCustomerToken(res.accessToken);
              if (mounted) await fetchCurrentUser();
            }
          }
        } else {
          const res = await apiPost<{ accessToken: string }>("/auth/customer/refresh", undefined, { authScope: "CUSTOMER" });
          if (res?.accessToken) {
            setCustomerToken(res.accessToken);
            if (mounted) await fetchCurrentUser();
          }
        }
      } catch {
        // Not logged in
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const cleanup = onCustomerUnauthorized(() => {
      setUser(null);
      setCustomerToken(null);
      if (typeof window !== "undefined") localStorage.removeItem(CUSTOMER_USER_KEY);
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, [fetchCurrentUser]);

  const login = async (credentials: { emailOrPhone: string; password: string; email?: string }) => {
    setIsLoading(true);
    try {
      const payload = {
        emailOrPhone: credentials.emailOrPhone || credentials.email,
        password: credentials.password,
      };
      const res = await apiPost<{ accessToken: string }>("/auth/customer/login", payload, { authScope: "CUSTOMER" });
      if (res?.accessToken) {
        setCustomerToken(res.accessToken);
        const profile = await fetchCurrentUser();
        return profile;
      }
      throw new Error("Failed to obtain customer access token");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiPost("/auth/customer/logout", undefined, { authScope: "CUSTOMER" });
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setCustomerToken(null);
      if (typeof window !== "undefined") localStorage.removeItem(CUSTOMER_USER_KEY);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const hasPermission = () => false;

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthenticated: !!user,
        isLoading,
        customerName: user ? user.name : "",
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}

// 2. STAFF AUTH CONTEXT
const StaffAuthContext = createContext<AuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STAFF_USER_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getStaffToken();
      if (!token) {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem(STAFF_USER_KEY);
        return null;
      }
      const profile = await apiGet<AuthUser>("/auth/me", undefined, { authScope: "STAFF" });
      if (profile && profile.userType === "STAFF") {
        setUser(profile);
        if (typeof window !== "undefined") {
          localStorage.setItem(STAFF_USER_KEY, JSON.stringify(profile));
        }
        return profile;
      } else {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem(STAFF_USER_KEY);
        return null;
      }
    } catch {
      setUser(null);
      if (typeof window !== "undefined") localStorage.removeItem(STAFF_USER_KEY);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getStaffToken();
        if (token) {
          const profile = await fetchCurrentUser();
          if (!profile) {
            const res = await apiPost<{ accessToken: string }>("/auth/staff/refresh", undefined, { authScope: "STAFF" });
            if (res?.accessToken) {
              setStaffToken(res.accessToken);
              if (mounted) await fetchCurrentUser();
            }
          }
        } else {
          const res = await apiPost<{ accessToken: string }>("/auth/staff/refresh", undefined, { authScope: "STAFF" });
          if (res?.accessToken) {
            setStaffToken(res.accessToken);
            if (mounted) await fetchCurrentUser();
          }
        }
      } catch {
        // Not logged in as staff
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const cleanup = onStaffUnauthorized(() => {
      setUser(null);
      setStaffToken(null);
      if (typeof window !== "undefined") localStorage.removeItem(STAFF_USER_KEY);
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, [fetchCurrentUser]);

  const login = async (credentials: { emailOrPhone: string; password: string; email?: string }) => {
    setIsLoading(true);
    try {
      const payload = {
        email: credentials.email || credentials.emailOrPhone,
        emailOrPhone: credentials.emailOrPhone || credentials.email,
        password: credentials.password,
      };
      const res = await apiPost<{ accessToken: string }>("/auth/staff/login", payload, { authScope: "STAFF" });
      if (res?.accessToken) {
        setStaffToken(res.accessToken);
        const profile = await fetchCurrentUser();
        return profile;
      }
      throw new Error("Failed to obtain staff access token");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiPost("/auth/staff/logout", undefined, { authScope: "STAFF" });
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setStaffToken(null);
      if (typeof window !== "undefined") localStorage.removeItem(STAFF_USER_KEY);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const hasPermission = useCallback(
    (moduleName: string, action = "READ"): boolean => {
      if (!user || user.userType !== "STAFF") return false;

      const roleName = user.role?.name?.toLowerCase() || "";
      const isGlobalAdmin =
        roleName === "admin" ||
        roleName === "super admin" ||
        (user.role?.scope === "GLOBAL" && roleName.includes("admin"));
      if (isGlobalAdmin) return true;

      const perms = user.role?.permissions || user.permissions || [];
      const match = perms.find(
        (p) =>
          p.module?.toUpperCase() === moduleName?.toUpperCase() &&
          p.action?.toUpperCase() === action?.toUpperCase(),
      );
      return match ? match.allowed : false;
    },
    [user],
  );

  return (
    <StaffAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthenticated: !!user,
        isLoading,
        customerName: user ? user.name : "",
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return context;
}

// 3. UNIFIED / ADAPTIVE AUTH PROVIDER (Wraps both customer & staff)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <StaffAuthProvider>
        {children}
      </StaffAuthProvider>
    </CustomerAuthProvider>
  );
}

// Adaptive useAuth: automatically routes to StaffAuth when in /admin, else CustomerAuth
export function useAuth() {
  const staffCtx = useContext(StaffAuthContext);
  const customerCtx = useContext(CustomerAuthContext);

  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    if (staffCtx) return staffCtx;
  }

  if (customerCtx) return customerCtx;
  if (staffCtx) return staffCtx;

  throw new Error("useAuth must be used within an AuthProvider");
}

export const useMockAuth = useAuth;
export const MockAuthProvider = AuthProvider;

