"use client";

// =====================================================================
// TRANG TỔNG QUAN  ->  mở bằng đường link /admin
//
// Hiện các ô thống kê: mỗi mục (danh mục, sản phẩm...) có bao nhiêu bản ghi.
// Bấm vào ô nào thì chuyển sang trang quản lý của mục đó.
// =====================================================================

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchList } from "@/lib/api";
import { MENU } from "@/lib/menu";

export default function OverviewPage() {
  // counts = { "danh-muc": 5, "san-pham": 20, ... }
  const [counts, setCounts] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // Với mỗi mục: lấy danh sách rồi đếm số dòng
    MENU.forEach((item) => {
      fetchList(item.key)
        .then((rows) => setCounts((old) => ({ ...old, [item.key]: rows.length })))
        .catch(() => setCounts((old) => ({ ...old, [item.key]: "lỗi" })));
    });
  }, []);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Tổng quan</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {MENU.map((item) => (
          <Link
            key={item.key}
            href={`/admin/${item.key}`}
            className="rounded-lg border border-stone-200 bg-white p-5 hover:border-teal-600"
          >
            <div className="text-sm text-slate-500">{item.title}</div>
            {/* Chưa đếm xong thì hiện "…" */}
            <div className="mt-1 text-3xl font-semibold">{counts[item.key] ?? "…"}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
