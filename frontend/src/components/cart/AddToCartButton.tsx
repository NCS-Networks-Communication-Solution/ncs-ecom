"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export function AddToCartButton({ productId }: { productId: string }) {
  const { addToCart, hasSession } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!hasSession) {
      setError("Authenticate first to add items to cart");
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      await addToCart(productId, 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-3 space-y-1">
      <button
        className="w-full rounded-md bg-cyan-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={handleClick}
        disabled={isAdding}
      >
        {isAdding ? "Adding…" : "Add to cart"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
