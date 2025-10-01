import { ReactNode } from "react";
import { AdminAppLayout } from "@/components/admin/AdminAppLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAppLayout>{children}</AdminAppLayout>;
}
