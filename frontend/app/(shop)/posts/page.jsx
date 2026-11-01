"use client";

// =====================================================================
// TRANG DANH SÁCH BÀI VIẾT  ->  /posts
//   - Lọc theo chủ đề, tìm theo tiêu đề, phân trang (9 bài / trang)
//   - Bấm vào bài để xem chi tiết  ->  /posts/{slug}
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { API, callApi } from "@/lib/api";
import { date, mediaUrl } from "@/lib/format";

export default function PostsPage() {
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState(""); // slug chủ đề đang chọn ("" = tất cả)
  const [keyword, setKeyword] = useState(""); // từ khoá đã áp dụng
  const [keywordInput, setKeywordInput] = useState(""); // ô đang gõ
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null); // { key, posts, meta, error }

  // Mỗi tổ hợp bộ lọc có 1 "key"; key của kết quả khác key hiện tại => đang tải
  const key = `${topic}|${keyword}|${page}`;
  const loading = result?.key !== key;

  useEffect(() => {
    let alive = true;
    callApi(`${API}/chu-de-bai-viet`, { cache: "no-store" })
      .then((json) => alive && setTopics(json.data ?? []))
      .catch(() => {}); // không tải được chủ đề thì vẫn xem được bài viết
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({ page: String(page) });
    if (topic) params.set("chu_de", topic);
    if (keyword) params.set("tu_khoa", keyword);

    callApi(`${API}/bai-viet?${params}`, { cache: "no-store" })
      .then((json) => alive && setResult({ key, posts: json.data ?? [], meta: json.meta ?? null, error: "" }))
      .catch((cause) => {
        if (alive) setResult({ key, posts: [], meta: null, error: cause instanceof Error ? cause.message : "Không tải được bài viết." });
      });

    return () => {
      alive = false;
    };
  }, [key, topic, keyword, page]);

  const chooseTopic = (slug) => {
    setTopic(slug);
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(1);
  };

  const lastPage = Number(result?.meta?.last_page) || 1;
  const posts = result?.posts ?? [];

  return (
    <section className="mx-auto min-h-72 max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bài viết</h1>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseTopic("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${topic === "" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Tất cả
          </button>
          {topics.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseTopic(item.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${topic === item.slug ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {item.ten_chu_de}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Tìm
          </button>
        </form>
      </div>

      {result?.error && !loading && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{result.error}</p>}

      {loading && <p className="py-16 text-center text-slate-500">Đang tải bài viết...</p>}

      {!loading && !result?.error && posts.length === 0 && (
        <p className="py-16 text-center text-slate-500">Chưa có bài viết nào.</p>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const image = mediaUrl(post.hinh_anh_url);
              return (
                <article key={post.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <Link href={`/posts/${post.slug}`} className="relative block aspect-video bg-slate-100">
                    {image ? (
                      <Image src={image} alt={post.tieu_de} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm text-slate-400">Không có ảnh</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-slate-500">
                      {post.chu_de?.ten_chu_de && <span className="mr-2 font-semibold text-blue-600">{post.chu_de.ten_chu_de}</span>}
                      {date(post.created_at)}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">
                      <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">{post.tieu_de}</Link>
                    </h2>
                    {post.tom_tat && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.tom_tat}</p>}
                    <Link href={`/posts/${post.slug}`} className="mt-auto pt-4 text-sm font-semibold text-blue-600 hover:underline">
                      Đọc tiếp →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {lastPage > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Trước
              </button>
              <span className="text-slate-600">Trang {page} / {lastPage}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
