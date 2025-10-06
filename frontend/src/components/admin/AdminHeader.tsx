"use client";

import { useAdminAuth } from "./AdminContext";

export function AdminHeader() {
  const { auth, logout } = useAdminAuth();

  if (!auth) return null;

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-4">
      <div className="flex flex-col">
        <span className="text-sm text-slate-400">Signed in as</span>
        <span className="text-lg font-semibold text-slate-100">{auth.user.name}</span>
        <span className="text-xs uppercase tracking-wide text-cyan-400">{auth.user.role}</span>
      </div>
      <div className="flex items-center gap-3">
        {auth.user.company && (
          <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            <div className="font-semibold text-cyan-300">{auth.user.company.name}</div>
            <div className="text-slate-500">Tier: {auth.user.company.tier}</div>
          </div>
        )}
        <button
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
