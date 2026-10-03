"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RESOURCES, fetchList } from "@/lib/admin-config";

export default function Overview() {
  const [counts, setCounts] = useState<Record<string, number | string>>({});
  useEffect(() => {
    RESOURCES.forEach((r) =>
      fetchList(r.key)
        .then((rows) => setCounts((c) => ({ ...c, [r.key]: rows.length })))
        .catch(() => setCounts((c) => ({ ...c, [r.key]: "lỗi" })))
    );
  }, []);
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Tổng quan</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {RESOURCES.map((r) => (
          <Link key={r.key} href={`/admin/${r.key}`} className="rounded-lg border border-stone-200 bg-white p-5 hover:border-teal-600">
            <div className="text-sm text-slate-500">{r.title}</div>
            <div className="mt-1 text-3xl font-semibold">{counts[r.key] ?? "…"}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
