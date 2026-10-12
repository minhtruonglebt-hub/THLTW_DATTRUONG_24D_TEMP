"use client";

// =====================================================================
// TRANG ĐƠN HÀNG  ->  mở bằng đường link /admin/don-hang
//
// Chức năng:
//   - Xem danh sách đơn hàng, tìm kiếm
//   - Huỷ đơn (chỉ đơn đang "Chờ xác nhận")
// Đơn hàng do khách đặt nên admin KHÔNG thêm / sửa / xoá ở đây.
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { date, matches, money } from "@/lib/format";
import Badge from "../../components/Badge";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { Table, Tr, Td } from "../../components/Table";

// Ghép danh sách sản phẩm của đơn thành 1 câu: "Áo thun ×2, Quần jean ×1"
function productText(order: Row): string {
  const items: Row[] = order.chi_tiets ?? [];
  const names = items.map((c) => `${c.ten_san_pham ?? c.san_pham?.ten_san_pham} ×${c.so_luong}`);
  return names.join(", ") || "—";
}

// Nhãn trạng thái đơn hàng
function StatusBadge({ status }: { status: string }) {
  if (status === "cho_xac_nhan") return <Badge text="Chờ xác nhận" tone="warn" />;
  if (status === "da_huy") return <Badge text="Đã huỷ" tone="off" />;
  return <Badge text={status} tone="ok" />;
}

export default function DonHangPage() {
  const { rows, error, reload } = useList("don-hang");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Lọc theo ô tìm kiếm (tìm theo mã đơn, tên, SĐT, địa chỉ, sản phẩm)
  const list = (rows ?? []).filter((r) =>
    matches(search, [r.ma_don_hang, r.ho_ten, r.so_dien_thoai, r.dia_chi_giao_hang, productText(r)])
  );

  // Bấm "Huỷ đơn"
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

  return (
    <>
      <PageHeader title="Đơn hàng" count={list.length} search={search} onSearch={setSearch} />

      <Notice text={error} />
      <Notice text={notice?.text} ok={notice?.ok} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table
          headers={["Mã đơn", "Khách nhận", "Địa chỉ giao", "Sản phẩm", "Tổng tiền", "Thanh toán", "Tài khoản", "Trạng thái", "Ngày đặt"]}
          hasActions
          isEmpty={list.length === 0}
        >
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.ma_don_hang}</Td>
              <Td>
                {r.ho_ten} · {r.so_dien_thoai}
              </Td>
              <Td>{r.dia_chi_giao_hang ?? "—"}</Td>
              <Td>{productText(r)}</Td>
              <Td>{money(r.tong_tien)}</Td>
              <Td>{r.phuong_thuc_thanh_toan ?? "—"}</Td>
              <Td>{r.nguoi_dung_id ?? "Khách"}</Td>
              <Td>
                <StatusBadge status={r.trang_thai} />
              </Td>
              <Td>{date(r.created_at)}</Td>
              <Td right>
                {/* Chỉ đơn đang chờ xác nhận mới huỷ được */}
                {r.trang_thai === "cho_xac_nhan" && (
                  <button
                    onClick={() => handleCancel(r)}
                    className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    Huỷ đơn
                  </button>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
