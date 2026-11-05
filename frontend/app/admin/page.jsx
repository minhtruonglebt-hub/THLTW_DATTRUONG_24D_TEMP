"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchList } from "@/lib/api";
import { MENU } from "@/lib/menu";

export default function AdminPage() {
  // counts[key] = { value: số lượng | null, hasError: true/false }
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadCounts() {
      const entries = await Promise.all(
        MENU.map(async (item) => {
          if (item.showCount === false) return [item.key, { value: null, hasError: false }];
          try {
            const rows = await fetchList(item.key);
            return [item.key, { value: rows.length, hasError: false }];
          } catch {
            return [item.key, { value: null, hasError: true }];
          }
        }),
      );

      if (isMounted) setCounts(Object.fromEntries(entries));
    }

    loadCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Bảng điều khiển</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Tổng quan cửa hàng</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80">Theo dõi và quản lý các hoạt động kinh doanh của bạn tại một nơi.</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">Xem cửa hàng <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-slate-900">Quản lý nội dung</h2><p className="mt-1 text-sm text-slate-500">Chọn khu vực bạn muốn thao tác</p></div>
        <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">{MENU.length} khu vực</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MENU.map((item) => (
          <Link
            key={item.key}
            href={`/admin/${item.path}`}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_-24px_rgba(15,23,42,0.55)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">{item.title}</p>
                {item.showCount !== false && <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                  {counts[item.key]?.hasError ? "Lỗi tải" : counts[item.key]?.value ?? "…"}
                </p>}
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-lg font-extrabold text-blue-700 transition group-hover:rotate-3 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                {item.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400 transition group-hover:text-blue-700">
              Mở danh sách <span aria-hidden="true" className="text-base">→</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
