"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Product = {
  id: string;
  nameEn: string;
  nameTh: string;
  sku: string;
  price: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    company: { id: string; name: string; tier: string } | null;
  };
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productStatus, setProductStatus] = useState<string>("Loading catalog…");
  const [email, setEmail] = useState("admin@ncs.co.th");
  const [password, setPassword] = useState("admin123");
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Ready to authenticate");

  const productsEndpoint = useMemo(() => `${API_URL}/products`, []);
  const loginEndpoint = useMemo(() => `${API_URL}/auth/login`, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(productsEndpoint, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data);
        setProductStatus(`Loaded ${data.length} products from API`);
      } catch (error) {
        console.error(error);
        setProductStatus("Failed to load product catalog. Is the backend running on port 3001?");
      }
    }

    loadProducts();
  }, [productsEndpoint]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus("Authenticating…");

    try {
      const res = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as AuthResponse;
      setAuthResult(data);
      setAuthStatus(`Authenticated as ${data.user.name} – token expires in ${Math.round(data.expiresIn / 3600)}h`);
    } catch (error) {
      console.error(error);
      setAuthStatus("Login failed – double check credentials and backend status.");
      setAuthResult(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">NCS B2B Catalog Preview</h1>
          <p className="text-sm text-slate-400">
            Backend base URL: <span className="font-mono">{API_URL}</span>
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-xl font-medium mb-4">Authenticate</h2>
            <form className="space-y-4" onSubmit={handleLogin}>
              <label className="block">
                <span className="text-sm text-slate-400">Email</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">Password</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-md bg-cyan-500 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                Get tokens
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-400">{authStatus}</p>

            {authResult && (
              <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300 border border-slate-800">
                {JSON.stringify(authResult, null, 2)}
              </pre>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-xl font-medium mb-2">Catalog</h2>
            <p className="text-sm text-slate-400">{productStatus}</p>
            <div className="mt-4 space-y-3 max-h-80 overflow-auto pr-1">
              {products.map((product) => (
                <article key={product.id} className="rounded border border-slate-800 bg-slate-950 p-3">
                  <header className="flex items-center justify-between text-sm text-slate-300">
                    <span className="font-mono">{product.sku}</span>
                    <span className="font-semibold text-cyan-400">฿{Number(product.price).toLocaleString()}</span>
                  </header>
                  <p className="mt-2 text-sm font-medium">{product.nameEn}</p>
                  <p className="text-xs text-slate-500">{product.nameTh}</p>
                </article>
              ))}
              {products.length === 0 && (
                <div className="rounded border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                  No products yet. Apply migrations and run `npm run db:seed` in backend.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
          <h2 className="text-lg font-medium text-slate-100">Smoke Checks</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-4">
            <li>Start Docker services: <code className="font-mono">docker compose up -d postgres redis</code></li>
            <li>Run backend API: <code className="font-mono">npm run start:dev</code> from <code className="font-mono">/backend</code></li>
            <li>Launch this frontend: <code className="font-mono">npm run dev</code>, then visit <code className="font-mono">http://localhost:3000</code></li>
            <li>Use the seeded credentials to verify login and catalog rendering.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
