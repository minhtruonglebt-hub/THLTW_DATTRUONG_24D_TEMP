"use client";

// =====================================================================
// TRANG ĐƠN HÀNG  ->  mở bằng đường link /admin/don-hang
//
// Chức năng:
//   1. Xem danh sách đơn hàng    2. Tìm kiếm    3. Huỷ đơn (chỉ đơn "Chờ xác nhận")
// Đơn hàng do khách đặt nên admin KHÔNG thêm / sửa / xoá ở đây.
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { date, money } from "@/lib/format";

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const th = "whitespace-nowrap px-4 py-3 font-medium"; // ô tiêu đề cột
const td = "px-4 py-3"; // ô dữ liệu

// Ghép các sản phẩm của đơn thành 1 câu: "Áo thun ×2, Quần jean ×1"
function productText(order: Row): string {
  const items: Row[] = order.chi_tiets ?? [];
  const names = items.map((c) => `${c.ten_san_pham ?? c.san_pham?.ten_san_pham} ×${c.so_luong}`);
  return names.join(", ") || "—";
}

export default function DonHangPage() {
  // ---------- 1. DỮ LIỆU ----------
  const { rows, error, reload } = useList("don-hang");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // ---------- 2. TÌM KIẾM ----------
  // Giữ lại những dòng có (mã đơn + tên + SĐT + địa chỉ + sản phẩm) chứa từ khoá.
  const keyword = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r) =>
    `${r.ma_don_hang} ${r.ho_ten} ${r.so_dien_thoai} ${r.dia_chi_giao_hang} ${productText(r)}`.toLowerCase().includes(keyword)
  );

  // ---------- 3. HUỶ ĐƠN ----------
  async function handleCancel(order: Row) {
    if (!confirm(`Huỷ đơn ${order.ma_don_hang}?`)) return;
    try {
      await callApi(`${API}/don-hang/${order.id}/huy`, { method: "POST" });
      setNotice({ ok: true, text: "Đã huỷ đơn" });
      reload();
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }

  // ---------- GIAO DIỆN ----------
  return (
    <>
      {/* Đầu trang: tiêu đề, ô tìm kiếm (không có nút thêm) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Đơn hàng</h1>
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
      {notice && (
        <p className={`mb-4 rounded-lg p-3 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {notice.text}
        </p>
      )}
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {/* Bảng danh sách */}
      {rows && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-slate-600">
              <tr>
                <th className={th}>Mã đơn</th>
                <th className={th}>Khách nhận</th>
                <th className={th}>Địa chỉ giao</th>
                <th className={th}>Sản phẩm</th>
                <th className={th}>Tổng tiền</th>
                <th className={th}>Thanh toán</th>
                <th className={th}>Tài khoản</th>
                <th className={th}>Trạng thái</th>
                <th className={th}>Ngày đặt</th>
                <th className={`${th} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 hover:bg-teal-50/40">
                  <td className={td}>{r.ma_don_hang}</td>
                  <td className={td}>
                    {r.ho_ten} · {r.so_dien_thoai}
                  </td>
                  <td className={td}>{r.dia_chi_giao_hang ?? "—"}</td>
                  <td className={td}>{productText(r)}</td>
                  <td className={td}>{money(r.tong_tien)}</td>
                  <td className={td}>{r.phuong_thuc_thanh_toan ?? "—"}</td>
                  <td className={td}>{r.nguoi_dung_id ?? "Khách"}</td>
                  <td className={td}>
                    {/* Mỗi trạng thái một màu */}
                    {r.trang_thai === "cho_xac_nhan" && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Chờ xác nhận</span>
                    )}
                    {r.trang_thai === "da_huy" && (
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Đã huỷ</span>
                    )}
                    {r.trang_thai !== "cho_xac_nhan" && r.trang_thai !== "da_huy" && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{r.trang_thai}</span>
                    )}
                  </td>
                  <td className={td}>{date(r.created_at)}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {/* Chỉ đơn đang chờ xác nhận mới có nút Huỷ đơn */}
                    {r.trang_thai === "cho_xac_nhan" && (
                      <button onClick={() => handleCancel(r)} className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                        Huỷ đơn
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
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
