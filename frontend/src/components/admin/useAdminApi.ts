"use client";

import { useCallback } from "react";
import { useAdminAuth } from "./AdminContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useAdminApi() {
  const { apiFetch } = useAdminAuth();

  const getOverview = useCallback(async () => {
    const response = await apiFetch(`${API_URL}/admin/overview`);
    if (!response.ok) {
      throw new Error("Failed to load overview");
    }
    return response.json();
  }, [apiFetch]);

  const listUsers = useCallback(
    async (params: { companyId?: string; role?: string; status?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.companyId) searchParams.set("companyId", params.companyId);
      if (params.role) searchParams.set("role", params.role);
      if (params.status) searchParams.set("status", params.status);

      const url = `${API_URL}/admin/users${searchParams.toString() ? `?${searchParams}` : ""}`;
      const response = await apiFetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      return response.json();
    },
    [apiFetch],
  );

  const createUser = useCallback(
    async (payload: {
      email: string;
      name: string;
      password: string;
      role: string;
      companyId: string;
    }) => {
      const response = await apiFetch(`${API_URL}/admin/users`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Failed to create user");
      }

      return response.json();
    },
    [apiFetch],
  );

  const updateUser = useCallback(
    async (id: string, payload: Partial<{ email: string; name: string; password: string; role: string; companyId: string }>) => {
      const response = await apiFetch(`${API_URL}/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Failed to update user");
      }

      return response.json();
    },
    [apiFetch],
  );

  const updateUserStatus = useCallback(
    async (id: string, isActive: boolean) => {
      const response = await apiFetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      return response.json();
    },
    [apiFetch],
  );

  const listProducts = useCallback(
    async (params: { search?: string; categoryId?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.categoryId) searchParams.set("categoryId", params.categoryId);
      const url = `${API_URL}/admin/products${searchParams.toString() ? `?${searchParams}` : ""}`;
      const response = await apiFetch(url);
      if (!response.ok) {
        throw new Error("Failed to load products");
      }
      return response.json();
    },
    [apiFetch],
  );

  const createProduct = useCallback(
    async (payload: {
      sku: string;
      nameEn: string;
      nameTh: string;
      description?: string;
      price: number;
      stock: number;
      categoryId: string;
    }) => {
      const response = await apiFetch(`${API_URL}/admin/products`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Failed to create product");
      }

      return response.json();
    },
    [apiFetch],
  );

  const updateProduct = useCallback(
    async (
      id: string,
      payload: Partial<{
        sku: string;
        nameEn: string;
        nameTh: string;
        description?: string;
        price: number;
        stock: number;
        categoryId: string;
      }>,
    ) => {
      const response = await apiFetch(`${API_URL}/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Failed to update product");
      }

      return response.json();
    },
    [apiFetch],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const response = await apiFetch(`${API_URL}/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      return response.json();
    },
    [apiFetch],
  );

  return {
    getOverview,
    listUsers,
    createUser,
    updateUser,
    updateUserStatus,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
