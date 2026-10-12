"use client";

// =====================================================================
// TRANG DANH MỤC  ->  mở bằng đường link /admin/danh-muc
//
// Chức năng:
//   - Xem danh sách danh mục
//   - Tìm kiếm
//   - Thêm / Sửa  (form nằm ở file DanhMucForm.tsx cùng thư mục)
//   - Xoá
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { matches } from "@/lib/format";
import Badge from "../../components/Badge";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RowActions from "../../components/RowActions";
import { Table, Tr, Td } from "../../components/Table";
import DanhMucForm from "./DanhMucForm";

export default function DanhMucPage() {
  // rows = danh sách từ Laravel, error = lỗi khi tải, reload = tải lại
  const { rows, error, reload } = useList("danh-muc");

  const [search, setSearch] = useState(""); // nội dung ô tìm kiếm
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null); // thông báo "Đã xoá"...
  const [showForm, setShowForm] = useState(false); // đang mở form thêm/sửa?
  const [editing, setEditing] = useState<Row | null>(null); // dòng đang sửa (null = đang thêm mới)

  // Lọc danh sách theo ô tìm kiếm (tìm theo ID, tên, slug)
  const list = (rows ?? []).filter((r) => matches(search, [r.id, r.ten_danh_muc, r.slug]));

  // Bấm "+ Thêm mới"
  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  // Bấm "Sửa"
  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  // Form lưu xong: đóng form, báo thành công, tải lại danh sách
  function handleSaved() {
    setShowForm(false);
    setNotice({ ok: true, text: "Đã lưu" });
    reload();
  }

  // Bấm "Xoá"
  async function handleDelete(row: Row) {
    if (!confirm("Xoá mục này? Hành động không thể hoàn tác.")) return;
    try {
      await callApi(`${API}/danh-muc/${row.id}`, { method: "DELETE" });
      setNotice({ ok: true, text: "Đã xoá" });
      reload();
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }

  return (
    <>
      <PageHeader title="Danh mục" count={list.length} search={search} onSearch={setSearch} onAdd={openAdd} />

      <Notice text={error} />
      <Notice text={notice?.text} ok={notice?.ok} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table
          headers={["ID", "Tên danh mục", "Slug", "Danh mục cha", "Trạng thái"]}
          hasActions
          isEmpty={list.length === 0}
        >
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.id}</Td>
              <Td>{r.ten_danh_muc}</Td>
              <Td>{r.slug ?? "—"}</Td>
              <Td>{r.parent_id ?? "—"}</Td>
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

      {showForm && <DanhMucForm row={editing} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </>
  );
}
