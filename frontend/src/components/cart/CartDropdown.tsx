"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/components/cart/CartItem";

export function CartDropdown() {
  const { items, totals, clearCart, isLoading, hasSession, error } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Cart
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
          {totals.totalQuantity}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl">
          {!hasSession && (
            <p className="text-sm text-slate-400">Authenticate to start adding items to your cart.</p>
          )}

          {hasSession && (
            <div className="space-y-4">
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">Cart Items</h3>
                {items.length > 0 && (
                  <button
                    className="text-xs text-slate-400 hover:text-slate-200"
                    onClick={() => clearCart()}
                    disabled={isLoading}
                  >
                    Clear all
                  </button>
                )}
              </header>

              {error && <p className="text-xs text-red-400">{error}</p>}

              {items.length === 0 && !error && (
                <p className="text-sm text-slate-400">Cart is empty.</p>
              )}

              {items.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <footer className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{totals.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>{totals.totalQuantity}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-cyan-300">
                    <span>Subtotal</span>
                    <span>฿{totals.subtotal.toLocaleString()}</span>
                  </div>
                </footer>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
