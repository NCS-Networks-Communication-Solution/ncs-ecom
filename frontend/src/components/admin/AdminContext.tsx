"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type AdminRole = "ADMIN" | "APPROVER" | "PURCHASER" | "USER";

type AdminCompany = {
  id: string;
  name: string;
  tier: string;
} | null;

type AdminAuthUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  company: AdminCompany;
};

type AdminAuthState = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AdminAuthUser;
};

type AdminAuthContextValue = {
  auth: AdminAuthState | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: AdminRole[]) => boolean;
  apiFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const STORAGE_KEY = "ncs-admin-auth";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AdminAuthState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AdminAuthState;
        setAuth(parsed);
      } catch (cause) {
        console.error("Failed to parse admin auth storage", cause);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as AdminAuthState;
      const allowedRoles: AdminRole[] = ["ADMIN", "APPROVER", "PURCHASER"];

      if (!allowedRoles.includes(data.user.role)) {
        throw new Error("Insufficient permissions for admin console");
      }

      setAuth(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Login failed");
      setAuth(null);
      localStorage.removeItem(STORAGE_KEY);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: AdminRole[]) => {
      if (!auth) return false;
      return roles.includes(auth.user.role);
    },
    [auth],
  );

  const apiFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      if (!auth) {
        throw new Error("Not authenticated");
      }

      const headers = new Headers(init.headers ?? {});
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
      headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

      const response = await fetch(input, {
        ...init,
        headers,
      });

      if (response.status === 401) {
        logout();
      }

      return response;
    },
    [auth, logout],
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({ auth, isLoading, error, login, logout, hasRole, apiFetch }),
    [auth, isLoading, error, login, logout, hasRole, apiFetch],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminProvider");
  }
  return context;
}
