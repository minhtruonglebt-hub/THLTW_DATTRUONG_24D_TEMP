"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESOURCES } from "@/lib/admin-config";

export default function Sidebar() {
  const path = usePathname();
  const items = [{ key: "", title: "Tổng quan" }, ...RESOURCES];
  return (
    <aside className="sticky top-0 h-screen w-60 shrink-0 bg-slate-950 px-4 py-6 text-slate-400">
      <div className="mb-8 px-3">
        <div className="text-lg font-semibold text-white">Cửa hàng</div>
        <div className="text-xs text-slate-500">Bảng quản trị</div>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((i) => {
          const href = i.key ? `/admin/${i.key}` : "/admin";
          const on = path === href;
          return (
            <Link key={href} href={href}
              className={`rounded-lg border-l-2 px-3 py-2 text-sm transition-colors ${on ? "border-teal-400 bg-slate-800 font-medium text-white" : "border-transparent hover:bg-slate-900 hover:text-slate-200"}`}>
              {i.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
