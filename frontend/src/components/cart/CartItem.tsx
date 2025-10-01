"use client";

import { useState } from "react";
import { CartItem as CartItemType } from "@/services/cartService";
import { useCart } from "@/contexts/CartContext";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateItem, removeItem } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(newQuantity: number) {
    if (newQuantity <= 0) {
      await handleRemove();
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await updateItem(item.product.id, newQuantity);
      setQuantity(newQuantity);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    setIsUpdating(true);
    setError(null);
    try {
      await removeItem(item.product.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-100">{item.product.nameEn}</div>
        <div className="text-xs text-slate-500">SKU {item.product.sku}</div>
        <div className="text-xs text-slate-500">฿{item.product.price.toLocaleString()}</div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
            onClick={() => handleUpdate(quantity - 1)}
            disabled={isUpdating}
          >
            -
          </button>
          <span className="min-w-[2rem] text-center text-sm text-slate-200">{quantity}</span>
          <button
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
            onClick={() => handleUpdate(quantity + 1)}
            disabled={isUpdating}
          >
            +
          </button>
        </div>
        <button
          className="text-xs text-red-300 hover:text-red-200"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
