"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, CartResponse, cartService } from "@/services/cartService";

interface CartContextValue {
  items: CartItem[];
  totals: CartResponse["totals"];
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  hasSession: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartResponse["totals"]>({ totalItems: 0, totalQuantity: 0, subtotal: 0 });
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSession = Boolean(accessToken);

  const applyCart = useCallback((cart: CartResponse) => {
    setItems(cart.items);
    setTotals(cart.totals);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const cart = await cartService.getCart(accessToken);
      applyCart(cart);
      setError(null);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, applyCart]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      if (!accessToken) {
        throw new Error("Please authenticate before adding items to cart");
      }
      setIsLoading(true);
      try {
        const cart = await cartService.addToCart(accessToken, productId, quantity);
        applyCart(cart);
        setError(null);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart],
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const cart = await cartService.updateItem(accessToken, productId, quantity);
        applyCart(cart);
        setError(null);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const cart = await cartService.removeItem(accessToken, productId);
        applyCart(cart);
        setError(null);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, applyCart],
  );

  const clearCart = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const cart = await cartService.clear(accessToken);
      applyCart(cart);
      setError(null);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, applyCart]);

  useEffect(() => {
    if (accessToken) {
      refreshCart().catch((err) => console.error(err));
    } else {
      setItems([]);
      setTotals({ totalItems: 0, totalQuantity: 0, subtotal: 0 });
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
