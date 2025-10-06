"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, CartResponse, cartService } from "@/services/cartService";
import type { CartRequestError } from "@/services/cartService";

const EMPTY_TOTALS = {
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
};

type CartAction = "load" | "add" | "update" | "remove" | "clear";

type CartErrorState = {
  message: string;
  status?: number;
  requestId?: string;
  action: CartAction;
};

interface CartContextValue {
  items: CartItem[];
  totals: {
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  isLoading: boolean;
  error: CartErrorState | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  hasSession: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartContextValue["totals"]>(EMPTY_TOTALS);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CartErrorState | null>(null);

  const buildCartErrorState = useCallback((err: unknown, action: CartAction): CartErrorState => {
    const requestError = err as CartRequestError | undefined;
    const message = err instanceof Error && err.message ? err.message : "Unexpected cart error";
    return {
      message,
      status: requestError?.status,
      requestId: requestError?.requestId,
      action,
    };
  }, []);

  const hasSession = Boolean(accessToken);

  const applyCart = useCallback((cart: CartResponse) => {
    setItems(cart.items);
    const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    setTotals({
      itemCount: cart.itemCount,
      totalQuantity,
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
    });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const cart = await cartService.getCart(accessToken);
      if (cart) {
        applyCart(cart);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(buildCartErrorState(err, "load"));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, applyCart, buildCartErrorState]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      if (!accessToken) {
        throw new Error("Please authenticate before adding items to cart");
      }
      setIsLoading(true);
      try {
        const cart = await cartService.addToCart(accessToken, productId, quantity);
        if (cart) {
          applyCart(cart);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(buildCartErrorState(err, "add"));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart, buildCartErrorState],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const cart = await cartService.updateItem(accessToken, itemId, quantity);
        if (cart) {
          applyCart(cart);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(buildCartErrorState(err, "update"));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart, buildCartErrorState],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const cart = await cartService.removeItem(accessToken, itemId);
        if (cart) {
          applyCart(cart);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError(buildCartErrorState(err, "remove"));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart, buildCartErrorState],
  );

  const clearCart = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const cart = await cartService.clear(accessToken);
      if (cart) {
        applyCart(cart);
      } else {
        setItems([]);
        setTotals(EMPTY_TOTALS);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(buildCartErrorState(err, "clear"));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, applyCart, buildCartErrorState]);

  useEffect(() => {
    if (accessToken) {
      refreshCart().catch((err) => console.error(err));
    } else {
      setItems([]);
      setTotals(EMPTY_TOTALS);
      setError(null);
    }
  }, [accessToken, refreshCart]);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totals,
      isLoading,
      error,
      refreshCart,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      setAccessToken,
      hasSession,
    }),
    [items, totals, isLoading, error, refreshCart, addToCart, updateItem, removeItem, clearCart, setAccessToken, hasSession],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
