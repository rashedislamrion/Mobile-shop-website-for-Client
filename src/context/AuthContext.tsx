"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, setAccessToken, onUnauthorized } from "@/lib/api-client";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("novamobile_user");
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
      const profile = await apiGet<AuthUser>("/auth/me");
      setUser(profile);
      if (typeof window !== "undefined") {
        if (profile) {
          localStorage.setItem("novamobile_user", JSON.stringify(profile));
        } else {
          localStorage.removeItem("novamobile_user");
        }
      }
      return profile;
    } catch {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("novamobile_user");
      }
      return null;
    }
  }, []);

  // Try auto session restore on mount via token / refresh cookie
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const profile = await fetchCurrentUser();
          if (!profile) {
            // Token might be expired, attempt refresh
            const res = await apiPost<{ accessToken: string }>("/auth/refresh");
            if (res?.accessToken) {
              setAccessToken(res.accessToken);
              if (mounted) {
                await fetchCurrentUser();
              }
            }
          }
        } else {
          const res = await apiPost<{ accessToken: string }>("/auth/refresh");
          if (res?.accessToken) {
            setAccessToken(res.accessToken);
            if (mounted) {
              await fetchCurrentUser();
            }
          }
        }
      } catch {
        // Not logged in or expired refresh token
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    const cleanup = onUnauthorized(() => {
      setUser(null);
      setAccessToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("novamobile_user");
      }
    });

    return () => {
      mounted = false;
      cleanup();
    };
  }, [fetchCurrentUser]);

  const login = async (
    credentials: { emailOrPhone: string; password: string; email?: string },
    isStaff = false,
  ) => {
    setIsLoading(true);
    try {
      const endpoint = isStaff ? "/auth/staff/login" : "/auth/customer/login";
      const payload = isStaff
        ? {
            email: credentials.email || credentials.emailOrPhone,
            emailOrPhone: credentials.emailOrPhone || credentials.email,
            password: credentials.password,
          }
        : {
            emailOrPhone: credentials.emailOrPhone,
            password: credentials.password,
          };

      const res = await apiPost<{ accessToken: string }>(endpoint, payload);
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        const profile = await fetchCurrentUser();
        return profile;
      }
      throw new Error("Failed to obtain access token");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setAccessToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("novamobile_user");
      }
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const hasPermission = useCallback(
    (moduleName: string, action = "READ"): boolean => {
      if (!user) return false;
      // Staff validation
      const isStaffUser = user.userType === "STAFF" || !!user.roleId || !!user.role;
      if (!isStaffUser) return false;

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

  const customerName = user ? user.name : "";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthenticated: !!user,
        isLoading,
        customerName,
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Backwards compatibility alias for components using useMockAuth/MockAuthProvider
export const useMockAuth = useAuth;
export const MockAuthProvider = AuthProvider;
