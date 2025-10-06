"use client";

import Link from "next/link";
import { AdminRole, useAdminAuth } from "./AdminContext";

const NAV_ITEMS: Array<{ href: string; label: string; roles: AdminRole[] }> = [
  { href: "/admin/dashboard", label: "Dashboard", roles: ["ADMIN", "SALES", "PURCHASER"] },
  { href: "/admin/users", label: "Users", roles: ["ADMIN"] },
  { href: "/admin/products", label: "Products", roles: ["ADMIN", "SALES", "PURCHASER"] },
];

export function AdminNav({ activePath }: { activePath: string }) {
  const { auth } = useAdminAuth();

  if (!auth) return null;

  return (
    <nav className="mt-2 space-y-1 px-4">
      {NAV_ITEMS.filter((item) => item.roles.includes(auth.user.role)).map((item) => {
        const isActive = activePath.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
              isActive ? "bg-cyan-500/10 text-cyan-300" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
