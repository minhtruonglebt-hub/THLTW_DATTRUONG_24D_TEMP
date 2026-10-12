"use client";

// =====================================================================
// TRANG GIỎ HÀNG  ->  mở bằng đường link /admin/gio-hang
//
// Chức năng: xem giỏ hàng của khách + tìm kiếm (chỉ xem, không sửa)
// =====================================================================

import { useState } from "react";
import { useList, type Row } from "@/lib/api";
import { matches, money } from "@/lib/format";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { Table, Tr, Td } from "../../components/Table";

// Chủ giỏ: người đã đăng nhập hoặc khách vãng lai (nhận biết bằng session_id)
function ownerText(cart: Row): string {
  return cart.nguoi_dung_id ? `Người dùng #${cart.nguoi_dung_id}` : `Khách (${cart.session_id})`;
}

// Ghép danh sách sản phẩm trong giỏ thành 1 câu: "Áo thun ×2, Quần jean ×1"
function productText(cart: Row): string {
  const items: Row[] = cart.chi_tiets ?? [];
  const names = items.map((c) => `${c.san_pham?.ten_san_pham} ×${c.so_luong}`);
  return names.join(", ") || "Giỏ trống";
}

export default function GioHangPage() {
  const { rows, error } = useList("gio-hang");
  const [search, setSearch] = useState("");

  // Lọc theo ô tìm kiếm (tìm theo ID, chủ giỏ, sản phẩm)
  const list = (rows ?? []).filter((r) => matches(search, [r.id, ownerText(r), productText(r)]));

  return (
    <>
      <PageHeader title="Giỏ hàng" count={list.length} search={search} onSearch={setSearch} />

      <Notice text={error} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table headers={["ID", "Chủ giỏ", "Sản phẩm", "Số lượng", "Tạm tính"]} isEmpty={list.length === 0}>
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.id}</Td>
              <Td>{ownerText(r)}</Td>
              <Td>{productText(r)}</Td>
              <Td>{r.tong_so_luong ?? 0}</Td>
              <Td>{money(r.tong_tien)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
