"use client";

// =====================================================================
// TRANG NGƯỜI DÙNG  ->  mở bằng đường link /admin/nguoi-dung
//
// Chức năng: xem danh sách tài khoản + tìm kiếm (chỉ xem, không sửa)
// =====================================================================

import { useState } from "react";
import { useList } from "@/lib/api";

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const th = "whitespace-nowrap px-4 py-3 font-medium"; // ô tiêu đề cột
const td = "px-4 py-3"; // ô dữ liệu

export default function NguoiDungPage() {
  // ---------- 1. DỮ LIỆU ----------
  const { rows, error } = useList("nguoi-dung");
  const [search, setSearch] = useState("");

  // ---------- 2. TÌM KIẾM ----------
  const keyword = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r) =>
    `${r.id} ${r.username} ${r.ho_ten} ${r.email} ${r.so_dien_thoai} ${r.dia_chi} ${r.vai_tro}`.toLowerCase().includes(keyword)
  );

  // ---------- GIAO DIỆN ----------
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Người dùng</h1>
          <p className="text-sm text-slate-500">{list.length} bản ghi</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm…"
          className={`${inputClass} w-64`}
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-slate-600">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Username</th>
                <th className={th}>Họ tên</th>
                <th className={th}>Email</th>
                <th className={th}>SĐT</th>
                <th className={th}>Địa chỉ</th>
                <th className={th}>Vai trò</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 hover:bg-teal-50/40">
                  <td className={td}>{r.id}</td>
                  <td className={td}>{r.username}</td>
                  <td className={td}>{r.ho_ten ?? "—"}</td>
                  <td className={td}>{r.email}</td>
                  <td className={td}>{r.so_dien_thoai ?? "—"}</td>
                  <td className={td}>{r.dia_chi ?? "—"}</td>
                  <td className={td}>
                    {/* admin = màu vàng, thành viên = màu xám */}
                    {r.vai_tro === "admin" ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{r.vai_tro}</span>
                    ) : (
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">{r.vai_tro}</span>
                    )}
                  </td>
                  <td className={td}>
                    {r.status ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Hoạt động</span>
                    ) : (
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Bị khoá</span>
                    )}
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
