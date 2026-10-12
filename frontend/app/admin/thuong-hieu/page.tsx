"use client";

// =====================================================================
// TRANG THƯƠNG HIỆU  ->  mở bằng đường link /admin/thuong-hieu
//
// Chức năng: xem danh sách (có logo), tìm kiếm, thêm, sửa, xoá
// (form thêm/sửa nằm ở file ThuongHieuForm.tsx cùng thư mục)
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { matches } from "@/lib/format";
import Badge from "../../components/Badge";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RowActions from "../../components/RowActions";
import Thumb from "../../components/Thumb";
import { Table, Tr, Td } from "../../components/Table";
import ThuongHieuForm from "./ThuongHieuForm";

export default function ThuongHieuPage() {
  const { rows, error, reload } = useList("thuong-hieu");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null); // null = đang thêm mới

  // Lọc theo ô tìm kiếm (tìm theo ID, tên, slug)
  const list = (rows ?? []).filter((r) => matches(search, [r.id, r.ten_thuong_hieu, r.slug]));

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
      await callApi(`${API}/thuong-hieu/${row.id}`, { method: "DELETE" });
      setNotice({ ok: true, text: "Đã xoá" });
      reload();
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }

  return (
    <>
      <PageHeader title="Thương hiệu" count={list.length} search={search} onSearch={setSearch} onAdd={openAdd} />

      <Notice text={error} />
      <Notice text={notice?.text} ok={notice?.ok} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table
          headers={["ID", "Logo", "Tên thương hiệu", "Slug", "Trạng thái"]}
          hasActions
          isEmpty={list.length === 0}
        >
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.id}</Td>
              <Td>
                <Thumb src={r.logo_url} className="h-8 w-8 object-contain" />
              </Td>
              <Td>{r.ten_thuong_hieu}</Td>
              <Td>{r.slug ?? "—"}</Td>
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

      {showForm && <ThuongHieuForm row={editing} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </>
  );
}
