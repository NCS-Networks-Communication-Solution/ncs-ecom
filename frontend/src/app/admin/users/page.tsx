"use client";

import dynamic from "next/dynamic";

const UserList = dynamic(() => import("@/components/admin/UserList").then((mod) => mod.UserList), {
  ssr: false,
});

export default function AdminUsersPage() {
  return <UserList />;
}
