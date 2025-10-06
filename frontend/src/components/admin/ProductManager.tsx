"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminApi } from "./useAdminApi";

type AdminProduct = {
  id: string;
  sku: string;
  nameEn: string;
  nameTh: string;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  specifications?: Record<string, unknown> | null;
  images?: string[] | null;
  price: string;
  stock: number;
  categoryId: string;
  categories?: {
    id: string;
    name: string;
    nameEn: string;
    nameTh: string;
  };
};

export function ProductManager() {
  const { listProducts, createProduct, updateProduct, deleteProduct } = useAdminApi();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filters, setFilters] = useState({ search: "", categoryId: "" });
  const [status, setStatus] = useState("Loading products…");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    nameEn: "",
    nameTh: "",
    descriptionEn: "",
    descriptionTh: "",
    specifications: "{}",
    images: "",
    price: 0,
    stock: 0,
    categoryId: "",
  });

  const filteredProducts = useMemo(() => {
    let data = [...products];
    if (filters.search) {
      const query = filters.search.toLowerCase();
      data = data.filter(
        (product) =>
          product.nameEn.toLowerCase().includes(query) ||
          product.nameTh.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      );
    }
    if (filters.categoryId) {
      data = data.filter((product) => product.categoryId === filters.categoryId);
    }
    return data;
  }, [products, filters]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await listProducts();
        setProducts(response);
        setStatus(`Loaded ${response.length} products`);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
        setStatus("Failed to load products");
      }
    }

    loadProducts();
  }, [listProducts]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let parsedSpecifications: Record<string, unknown> = {};
      const specsInput = newProduct.specifications.trim();
      if (specsInput.length > 0) {
        try {
          const parsed = JSON.parse(specsInput);
          if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Specifications must be a JSON object");
          }
          parsedSpecifications = parsed as Record<string, unknown>;
        } catch (parseError) {
          setError(parseError instanceof Error ? parseError.message : "Invalid specifications JSON");
          setIsSubmitting(false);
          return;
        }
      }

      const imageList = newProduct.images
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const payload = {
        sku: newProduct.sku,
        nameEn: newProduct.nameEn,
        nameTh: newProduct.nameTh,
        description: newProduct.descriptionEn || undefined,
        descriptionEn: newProduct.descriptionEn || undefined,
        descriptionTh: newProduct.descriptionTh || undefined,
        specifications: parsedSpecifications,
        images: imageList,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        categoryId: newProduct.categoryId,
      };

      const created = await createProduct(payload);
      setProducts((prev) => [created, ...prev]);
      setNewProduct({
        sku: "",
        nameEn: "",
        nameTh: "",
        descriptionEn: "",
        descriptionTh: "",
        specifications: "{}",
        images: "",
        price: 0,
        stock: 0,
        categoryId: "",
      });
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSave(productId: string, changes: Partial<AdminProduct>) {
    try {
      const payload: Record<string, unknown> = {};
      if (changes.sku !== undefined) payload.sku = changes.sku;
      if (changes.nameEn !== undefined) payload.nameEn = changes.nameEn;
      if (changes.nameTh !== undefined) payload.nameTh = changes.nameTh;
      if (changes.description !== undefined) payload.description = changes.description;
      if (changes.descriptionEn !== undefined) payload.descriptionEn = changes.descriptionEn;
      if (changes.descriptionTh !== undefined) payload.descriptionTh = changes.descriptionTh;
      if (changes.price !== undefined) payload.price = Number(changes.price);
      if (changes.stock !== undefined) payload.stock = Number(changes.stock);
      if (changes.categoryId !== undefined) payload.categoryId = changes.categoryId;
      if (changes.specifications !== undefined) payload.specifications = changes.specifications;
      if (changes.images !== undefined) payload.images = changes.images;

      const updated = await updateProduct(productId, payload);
      setProducts((prev) => prev.map((product) => (product.id === productId ? updated : product)));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  }

  async function handleSpecificationBlur(productId: string, rawValue: string) {
    const trimmed = rawValue.trim();
    if (trimmed.length === 0) {
      await handleSave(productId, { specifications: {} });
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Specifications must be a JSON object");
      }
      setError(null);
      await handleSave(productId, { specifications: parsed as Record<string, unknown> });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Invalid specifications JSON");
    }
  }

  async function handleImagesBlur(productId: string, rawValue: string) {
    const images = rawValue
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    await handleSave(productId, { images });
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Product Management</h1>
        <p className="text-sm text-slate-400">Create, update, and organise catalog products.</p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs uppercase text-slate-500">Search</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="Search products"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Category ID</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="Filter by category ID"
              value={filters.categoryId}
              onChange={(event) => setFilters((prev) => ({ ...prev, categoryId: event.target.value }))}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{status}</p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Add new product</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleCreate}>
          <div>
            <label className="text-xs uppercase text-slate-500">SKU</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.sku}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, sku: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Name (EN)</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.nameEn}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, nameEn: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Name (TH)</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.nameTh}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, nameTh: event.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs uppercase text-slate-500">Description (EN)</label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              rows={2}
              value={newProduct.descriptionEn}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, descriptionEn: event.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs uppercase text-slate-500">Description (TH)</label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              rows={2}
              value={newProduct.descriptionTh}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, descriptionTh: event.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs uppercase text-slate-500">Specifications (JSON)</label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              rows={3}
              value={newProduct.specifications}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, specifications: event.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs uppercase text-slate-500">Image URLs (comma separated)</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.images}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, images: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Price (THB)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.price}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, price: Number(event.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Stock</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.stock}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Category ID</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              value={newProduct.categoryId}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, categoryId: event.target.value }))}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-cyan-500 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create product"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Pricing</th>
              <th className="px-4 py-3 text-left">Inventory</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 bg-slate-950/80">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-4 align-top">
                  <div className="font-medium text-slate-100">{product.nameEn}</div>
                  <div className="text-xs text-slate-500">{product.nameTh}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-mono text-slate-400">{product.sku}</span> • Category: {product.categories?.name ?? product.categoryId}
                  </div>
                  <label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Description (EN)
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    rows={2}
                    defaultValue={product.descriptionEn ?? product.description ?? ""}
                    onBlur={(event) =>
                      handleSave(product.id, {
                        descriptionEn: event.target.value,
                        description: event.target.value,
                      })
                    }
                  />
                  <label className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Description (TH)
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    rows={2}
                    defaultValue={product.descriptionTh ?? ""}
                    onBlur={(event) => handleSave(product.id, { descriptionTh: event.target.value })}
                  />
                  <label className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Specifications (JSON)
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    rows={3}
                    defaultValue={JSON.stringify(product.specifications ?? {}, null, 2)}
                    onBlur={(event) => handleSpecificationBlur(product.id, event.target.value)}
                  />
                  <label className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Image URLs
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    defaultValue={(product.images ?? []).join(', ')}
                    onBlur={(event) => handleImagesBlur(product.id, event.target.value)}
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <label className="text-xs text-slate-500">Price (THB)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                    defaultValue={Number(product.price)}
                    onBlur={(event) => handleSave(product.id, { price: event.target.value })}
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <label className="text-xs text-slate-500">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                    defaultValue={product.stock}
                    onBlur={(event) => handleSave(product.id, { stock: Number(event.target.value) })}
                  />
                </td>
                <td className="px-4 py-4 text-right align-top">
                  <button
                    className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                  No products match the current filters.
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
