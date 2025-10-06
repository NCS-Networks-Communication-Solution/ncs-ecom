"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminRole, useAdminAuth } from "./AdminContext";
import { useAdminApi } from "./useAdminApi";

type AdminUserRecord = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  companies?: {
    id: string;
    name: string;
    tier: string;
  };
};

const ROLE_OPTIONS: AdminRole[] = ["ADMIN", "PURCHASER", "VIEWER", "SALES"];

export function UserList() {
  const { auth } = useAdminAuth();
  const { listUsers, createUser, updateUser, updateUserStatus } = useAdminApi();

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [status, setStatus] = useState<string>("Loading users…");
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ search: string; role: string; status: string }>(
    () => ({ search: "", role: "", status: "" }),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "VIEWER" as AdminRole,
    companyId: auth?.user.company?.id ?? "",
  });

  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (filters.search) {
      const query = filters.search.toLowerCase();
      data = data.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.companies?.name.toLowerCase().includes(query),
      );
    }
    if (filters.role) {
      data = data.filter((user) => user.role === filters.role);
    }
    if (filters.status === "active") {
      data = data.filter((user) => user.isActive);
    }
    if (filters.status === "inactive") {
      data = data.filter((user) => !user.isActive);
    }
    return data;
  }, [users, filters]);

  useEffect(() => {
    async function loadUsers() {
      try {
        setStatus("Loading users…");
        const response = await listUsers();
        setUsers(response);
        setStatus(`Loaded ${response.length} users`);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
        setStatus("Failed to load users");
      }
    }

    loadUsers();
  }, [listUsers]);

  async function handleRoleChange(userId: string, role: AdminRole) {
    try {
      await updateUser(userId, { role });
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  }

  async function handleStatusToggle(userId: string, isActive: boolean) {
    try {
      await updateUserStatus(userId, isActive);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive } : user)));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createUser(newUser);
      setUsers((prev) => [created, ...prev]);
      setNewUser({
        email: "",
        name: "",
        password: "",
        role: "VIEWER",
        companyId: auth?.user.company?.id ?? "",
      });
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">User Management</h1>
        <p className="text-sm text-slate-400">Manage user roles, activation, and company assignments.</p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <form className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs uppercase text-slate-500">Search</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="Search by name, email, or company"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Role</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={filters.role}
              onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Status</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">All users</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </form>
        <p className="mt-2 text-xs text-slate-500">{status}</p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Create new user</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <div>
            <label className="text-xs uppercase text-slate-500">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Name</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newUser.name}
              onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newUser.password}
              onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Role</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newUser.role}
              onChange={(event) =>
                setNewUser((prev) => ({ ...prev, role: event.target.value as AdminRole }))
              }
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Company ID</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newUser.companyId}
              onChange={(event) => setNewUser((prev) => ({ ...prev, companyId: event.target.value }))}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-cyan-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 bg-slate-950/80">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-slate-200">{user.companies?.name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{user.companies?.tier ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value as AdminRole)}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
                    onClick={() => handleStatusToggle(user.id, !user.isActive)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
