"use client";

import dynamic from "next/dynamic";

const ProductManager = dynamic(
  () => import("@/components/admin/ProductManager").then((mod) => mod.ProductManager),
  { ssr: false },
);

export default function AdminProductsPage() {
  return <ProductManager />;
}
