"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API, callApi } from "@/lib/api";

export default function StaticPage() {
  const { slug } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    callApi(`${API}/trang-don/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((json) => active && setResult({ page: json.data, error: "" }))
      .catch((cause) => active && setResult({ page: null, error: cause instanceof Error ? cause.message : "Không tải được trang." }));
    return () => { active = false; };
  }, [slug]);

  if (!result) return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-500">Đang tải...</p>;
  if (!result.page) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Không tìm thấy trang</h1><Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Về trang chủ</Link></div>;

  return <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
    <h1 className="text-3xl font-bold text-slate-900">{result.page.tieu_de}</h1>
    <div className="mt-6 whitespace-pre-wrap leading-8 text-slate-700">{result.page.noi_dung}</div>
  </article>;
}
