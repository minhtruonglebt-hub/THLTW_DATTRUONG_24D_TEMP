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
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Bảng điều khiển</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
        <p className="mt-2 text-slate-500">Chọn một mục để xem và quản lý dữ liệu cửa hàng.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MENU.map((item) => (
          <Link
            key={item.key}
            href={`/admin/${item.path}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {counts[item.key]?.hasError ? "Lỗi tải" : counts[item.key]?.value ?? "…"}
                </p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-xl font-bold text-teal-700 transition group-hover:bg-teal-100">
                {item.title.charAt(0)}
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-teal-700">
              Mở danh sách <span aria-hidden="true">→</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
