"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AdminProvider, useAdminAuth } from "./AdminContext";
import { AdminHeader } from "./AdminHeader";
import { AdminNav } from "./AdminNav";

function AdminAuthenticatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/70 lg:block">
          <div className="p-6">
            <Link href="/admin/dashboard" className="text-xl font-semibold text-cyan-400">
              NCS Admin Console
            </Link>
          </div>
          <AdminNav activePath={pathname ?? ""} />
        </aside>
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 bg-slate-950 p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminLogin() {
  const { login, error, isLoading } = useAdminAuth();
  const [email, setEmail] = useState("admin@ncs.co.th");
  const [password, setPassword] = useState("admin123");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Signing in…");
    try {
      await login(email, password);
      setStatus(null);
    } catch (err) {
      console.error(err);
      setStatus((err as Error).message ?? "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-cyan-400">NCS Admin Console</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in with an admin, approver, or purchaser account.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-cyan-500 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {(status || error) && <p className="mt-4 text-sm text-red-400">{status ?? error}</p>}
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { auth, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading admin console…
      </div>
    );
  }

  if (!auth) {
    return <AdminLogin />;
  }

  return <AdminAuthenticatedShell>{children}</AdminAuthenticatedShell>;
}

export function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
