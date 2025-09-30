const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type CartItem = {
  product: {
    id: string;
    sku: string;
    nameEn: string;
    nameTh: string;
    price: number;
  };
  quantity: number;
};

export type CartResponse = {
  items: CartItem[];
  totals: {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
  };
};

async function authorizedFetch(path: string, options: RequestInit, accessToken: string) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<CartResponse>;
}

export const cartService = {
  async getCart(accessToken: string) {
    return authorizedFetch("/cart", { method: "GET" }, accessToken);
  },

  async addToCart(accessToken: string, productId: string, quantity: number) {
    return authorizedFetch(
      "/cart/add",
      { method: "POST", body: JSON.stringify({ productId, quantity }) },
      accessToken,
    );
  },

  async updateItem(accessToken: string, productId: string, quantity: number) {
    return authorizedFetch(
      `/cart/item/${productId}`,
      { method: "PUT", body: JSON.stringify({ quantity }) },
      accessToken,
    );
  },

  async removeItem(accessToken: string, productId: string) {
    return authorizedFetch(`/cart/item/${productId}`, { method: "DELETE" }, accessToken);
  },

  async clear(accessToken: string) {
    return authorizedFetch("/cart", { method: "DELETE" }, accessToken);
  },
};
