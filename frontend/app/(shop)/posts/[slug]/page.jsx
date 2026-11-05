"use client";

// =====================================================================
// TRANG CHI TIẾT BÀI VIẾT  ->  /posts/{slug}
// Nội dung hiển thị dạng văn bản thường (mỗi đoạn cách nhau 1 dòng trống).
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { date, mediaUrl } from "@/lib/format";

export default function PostDetailPage() {
  const { slug } = useParams();
  const [result, setResult] = useState(null); // { slug, post, error }
  const loading = result?.slug !== slug;

  useEffect(() => {
    let alive = true;
    callApi(`${API}/bai-viet/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((json) => alive && setResult({ slug, post: json.data, error: "" }))
      .catch((cause) => {
        if (alive) setResult({ slug, post: null, error: cause instanceof Error ? cause.message : "Không tải được bài viết." });
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const post = result?.post;
  const image = mediaUrl(post?.hinh_anh_url);
  const paragraphs = (post?.noi_dung ?? "").split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);

  return (
    <article className="mx-auto min-h-72 max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/posts" className="text-sm font-medium text-blue-600 hover:underline">← Tất cả bài viết</Link>

      {loading && <p className="py-16 text-center text-slate-500">Đang tải bài viết...</p>}

      {!loading && result?.error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {result.error === "Không tìm thấy" ? "Không tìm thấy bài viết." : result.error}
        </p>
      )}

      {!loading && post && (
        <>
          <p className="mt-6 text-sm text-slate-500">
            {post.chu_de?.ten_chu_de && <span className="mr-2 font-semibold text-blue-600">{post.chu_de.ten_chu_de}</span>}
            {date(post.created_at)}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">{post.tieu_de}</h1>
          {post.tom_tat && <p className="mt-4 text-lg text-slate-600">{post.tom_tat}</p>}

          {image && (
            <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-slate-100">
              <Image src={image} alt={post.tieu_de} fill sizes="(max-width: 768px) 100vw, 768px" unoptimized priority className="object-cover" />
            </div>
          )}

          <div className="mt-8 space-y-4 leading-7 text-slate-800">
            {paragraphs.map((text, index) => (
              <p key={index} className="whitespace-pre-line">{text}</p>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
