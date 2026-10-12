"use client";

// =====================================================================
// TRANG SẢN PHẨM  ->  mở bằng đường link /admin/san-pham
//
// Chức năng: xem danh sách (có ảnh, giá, tồn kho...), tìm kiếm, thêm, sửa, xoá
// (form thêm/sửa nằm ở file SanPhamForm.tsx cùng thư mục)
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { matches, money } from "@/lib/format";
import Badge from "../../components/Badge";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RowActions from "../../components/RowActions";
import Thumb from "../../components/Thumb";
import { Table, Tr, Td } from "../../components/Table";
import SanPhamForm from "./SanPhamForm";

export default function SanPhamPage() {
  const { rows, error, reload } = useList("san-pham");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null); // null = đang thêm mới

  // Lọc theo ô tìm kiếm (tìm theo ID, tên sản phẩm, slug, tên danh mục, tên thương hiệu)
  const list = (rows ?? []).filter((r) =>
    matches(search, [r.id, r.ten_san_pham, r.slug, r.danh_muc?.ten_danh_muc, r.thuong_hieu?.name])
  );

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    setNotice({ ok: true, text: "Đã lưu" });
    reload();
  }

  async function handleDelete(row: Row) {
    if (!confirm("Xoá mục này? Hành động không thể hoàn tác.")) return;
    try {
      await callApi(`${API}/san-pham/${row.id}`, { method: "DELETE" });
      setNotice({ ok: true, text: "Đã xoá" });
      reload();
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }

  return (
    <>
      <PageHeader title="Sản phẩm" count={list.length} search={search} onSearch={setSearch} onAdd={openAdd} />

      <Notice text={error} />
      <Notice text={notice?.text} ok={notice?.ok} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table
          headers={["ID", "Ảnh", "Tên sản phẩm", "Danh mục", "Thương hiệu", "Giá", "Giá KM", "Tồn kho", "Lượt xem", "Trạng thái"]}
          hasActions
          isEmpty={list.length === 0}
        >
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.id}</Td>
              <Td>
                <Thumb src={r.hinh_anh_url} className="h-10 w-10 object-cover" />
              </Td>
              <Td>{r.ten_san_pham}</Td>
              <Td>{r.danh_muc?.ten_danh_muc ?? r.danh_muc_id}</Td>
              <Td>{r.thuong_hieu?.name ?? r.thuong_hieu_id}</Td>
              <Td>{money(r.gia)}</Td>
              <Td>{money(r.gia_khuyen_mai)}</Td>
              <Td>
                {/* Hết hàng (0) thì tô đỏ cho dễ thấy */}
                <span className={r.so_luong === 0 ? "font-semibold text-red-600" : ""}>{r.so_luong}</span>
              </Td>
              <Td>{r.luot_xem ?? "—"}</Td>
              <Td>
                <Badge text={r.status ? "Hiển thị" : "Ẩn"} tone={r.status ? "ok" : "off"} />
              </Td>
              <Td right>
                <RowActions onEdit={() => openEdit(r)} onDelete={() => handleDelete(r)} />
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {showForm && <SanPhamForm row={editing} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </>
  );
}
