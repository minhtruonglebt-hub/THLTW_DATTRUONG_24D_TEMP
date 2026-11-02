"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getToken, useCurrentUser } from "@/lib/auth";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!getToken() || !user) {
      router.replace("/admin/login");
    } else if (user.vai_tro !== "admin") {
      router.replace("/");
    }
  }, [pathname, router, user]);

  // Trang đăng nhập admin nằm trong /admin nhưng không cần thanh menu bên trái
  if (pathname === "/admin/login") return <>{children}</>;
  if (!user || user.vai_tro !== "admin") return <p className="p-8 text-center text-slate-500">Đang kiểm tra quyền quản trị...</p>;

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fa] text-slate-800 md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
        <div className="mx-auto w-full max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}
