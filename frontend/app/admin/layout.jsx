"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname();

  // Trang đăng nhập admin nằm trong /admin nhưng không cần thanh menu bên trái
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800 md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-10">{children}</main>
    </div>
  );
}
