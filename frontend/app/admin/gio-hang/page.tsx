"use client";

// =====================================================================
// TRANG GIỎ HÀNG  ->  mở bằng đường link /admin/gio-hang
//
// Chức năng: xem giỏ hàng của khách + tìm kiếm (chỉ xem, không sửa)
// =====================================================================

import { useState } from "react";
import { useList, type Row } from "@/lib/api";
import { money } from "@/lib/format";

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const th = "whitespace-nowrap px-4 py-3 font-medium"; // ô tiêu đề cột
const td = "px-4 py-3"; // ô dữ liệu

// Chủ giỏ: người đã đăng nhập, hoặc khách vãng lai (nhận biết bằng session_id)
function ownerText(cart: Row): string {
  return cart.nguoi_dung_id ? `Người dùng #${cart.nguoi_dung_id}` : `Khách (${cart.session_id})`;
}

// Ghép các sản phẩm trong giỏ thành 1 câu: "Áo thun ×2, Quần jean ×1"
function productText(cart: Row): string {
  const items: Row[] = cart.chi_tiets ?? [];
  const names = items.map((c) => `${c.san_pham?.ten_san_pham} ×${c.so_luong}`);
  return names.join(", ") || "Giỏ trống";
}

export default function GioHangPage() {
  // ---------- 1. DỮ LIỆU ----------
  const { rows, error } = useList("gio-hang");
  const [search, setSearch] = useState("");

  // ---------- 2. TÌM KIẾM ----------
  const keyword = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r) => `${r.id} ${ownerText(r)} ${productText(r)}`.toLowerCase().includes(keyword));

  // ---------- GIAO DIỆN ----------
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Giỏ hàng</h1>
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
                <th className={th}>Chủ giỏ</th>
                <th className={th}>Sản phẩm</th>
                <th className={th}>Số lượng</th>
                <th className={th}>Tạm tính</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 hover:bg-teal-50/40">
                  <td className={td}>{r.id}</td>
                  <td className={td}>{ownerText(r)}</td>
                  <td className={td}>{productText(r)}</td>
                  <td className={td}>{r.tong_so_luong ?? 0}</td>
                  <td className={td}>{money(r.tong_tien)}</td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
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
