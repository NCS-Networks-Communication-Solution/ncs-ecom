"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminApi } from "@/components/admin/useAdminApi";

interface OverviewResponse {
  totals: {
    users: number;
    activeUsers: number;
    products: number;
    orders: number;
    quotes: number;
    companies: number;
  };
}

export default function AdminDashboardPage() {
  const { getOverview } = useAdminApi();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [status, setStatus] = useState("Loading dashboard…");

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await getOverview();
        setOverview(data);
        setStatus("Dashboard ready");
      } catch (err) {
        console.error(err);
        setStatus("Failed to load dashboard metrics");
      }
    }

    loadOverview();
  }, [getOverview]);

  const totals = overview?.totals;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Operations Dashboard</h1>
        <p className="text-sm text-slate-400">Real-time snapshot of platform activity and shortcuts into management flows.</p>
        <p className="text-xs text-slate-500">{status}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricTile
          title="Active users"
          primary={totals ? `${totals.activeUsers}` : "--"}
          secondary={totals ? `${totals.users} total accounts` : ""}
        />
        <MetricTile
          title="Catalog products"
          primary={totals ? `${totals.products}` : "--"}
          secondary="Across all categories"
        />
        <MetricTile
          title="Companies"
          primary={totals ? `${totals.companies}` : "--"}
          secondary="Including customer tiers"
        />
        <MetricTile title="Orders" primary={totals ? `${totals.orders}` : "--"} secondary="All time" />
        <MetricTile title="Quotes" primary={totals ? `${totals.quotes}` : "--"} secondary="All time" />
        <QuickActions />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Next actions</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="flex items-start justify-between gap-4">
            <span>Review new purchaser accounts and assign approver roles as needed.</span>
            <Link className="text-cyan-400 hover:text-cyan-300" href="/admin/users">
              Manage users →
            </Link>
          </li>
          <li className="flex items-start justify-between gap-4">
            <span>Verify catalog stock levels before enabling cart flows.</span>
            <Link className="text-cyan-400 hover:text-cyan-300" href="/admin/products">
              Manage products →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

function MetricTile({ title, primary, secondary }: { title: string; primary: string; secondary: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-md">
      <h3 className="text-sm uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3 text-3xl font-semibold text-cyan-300">{primary}</div>
      <p className="mt-1 text-xs text-slate-500">{secondary}</p>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-md">
      <h3 className="text-sm uppercase tracking-wide text-slate-500">Quick actions</h3>
      <div className="mt-3 space-y-2 text-sm">
        <Link className="block rounded-md bg-cyan-500/10 px-3 py-2 text-cyan-200 transition hover:bg-cyan-500/20" href="/admin/users">
          Invite a new company contact
        </Link>
        <Link className="block rounded-md bg-cyan-500/10 px-3 py-2 text-cyan-200 transition hover:bg-cyan-500/20" href="/admin/products">
          Launch product bulk update
        </Link>
      </div>
    </div>
  );
}
