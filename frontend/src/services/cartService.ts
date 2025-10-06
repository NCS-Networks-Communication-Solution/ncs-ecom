const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
const CART_DIAGNOSTICS_ENABLED = process.env.NEXT_PUBLIC_CART_DEBUG === "true";

export type CartRequestError = Error & {
  status?: number;
  requestId?: string;
  details?: unknown;
};

function generateRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cart-${Math.random().toString(36).slice(2, 10)}`;
}

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    id: string;
    sku: string;
    nameEn: string;
    nameTh: string;
    price: number;
    description?: string | null;
    descriptionEn?: string | null;
    descriptionTh?: string | null;
    specifications: Record<string, unknown>;
    images: string[];
    categoryId: string;
    category: {
      id: string;
      nameEn: string;
      nameTh: string;
    } | null;
  };
};

export type CartResponse = {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
};

async function authorizedRequest(path: string, options: RequestInit, accessToken: string) {
  const requestId = generateRequestId();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Request-ID": requestId,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error: CartRequestError = new Error(
      errorBody?.message ?? `Request failed: ${response.status}`,
    ) as CartRequestError;
    error.status = response.status;
    error.requestId = requestId;
    error.details = errorBody;
    if (CART_DIAGNOSTICS_ENABLED) {
      console.error(`[cart] request ${requestId} failed`, {
        status: response.status,
        path,
        body: errorBody,
      });
    }
    throw error;
  }

  if (CART_DIAGNOSTICS_ENABLED) {
    console.info(`[cart] request ${requestId} succeeded`, {
      status: response.status,
      path,
    });
  }

  return response;
}

async function authorizedJson(path: string, options: RequestInit, accessToken: string) {
  const response = await authorizedRequest(path, options, accessToken);
  if (response.status === 204) {
    return null;
  }
  return (await response.json()) as CartResponse;
}

export const cartService = {
  async getCart(accessToken: string) {
    return authorizedJson("/cart", { method: "GET" }, accessToken) as Promise<CartResponse>;
  },

  async addToCart(accessToken: string, productId: string, quantity: number) {
    return authorizedJson(
      "/cart/items",
      { method: "POST", body: JSON.stringify({ productId, quantity }) },
      accessToken,
    ) as Promise<CartResponse>;
  },

  async updateItem(accessToken: string, itemId: string, quantity: number) {
    return authorizedJson(
      `/cart/items/${itemId}`,
      { method: "PATCH", body: JSON.stringify({ quantity }) },
      accessToken,
    ) as Promise<CartResponse>;
  },

  async removeItem(accessToken: string, itemId: string) {
    await authorizedRequest(`/cart/items/${itemId}`, { method: "DELETE" }, accessToken);
    return this.getCart(accessToken);
  },

  async clear(accessToken: string) {
    await authorizedRequest("/cart", { method: "DELETE" }, accessToken);
    return this.getCart(accessToken);
  },
};
