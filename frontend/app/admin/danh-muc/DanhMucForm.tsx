"use client";

// =====================================================================
// FORM THÊM / SỬA DANH MỤC (hiện dạng hộp nổi)
//
//   row = null  -> đang THÊM MỚI  (ô trống)
//   row = {...} -> đang SỬA       (ô điền sẵn dữ liệu của dòng đó)
//
// Các ô khớp với DanhMucRequest.php bên Laravel:
//   ten_danh_muc (bắt buộc), parent_id, mo_ta, status
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { Modal, Field, FormActions, inputClass } from "../../components/Form";

type Props = {
  row: Row | null;
  onClose: () => void; // đóng form
  onSaved: () => void; // lưu xong
};

export default function DanhMucForm({ row, onClose, onSaved }: Props) {
  // Danh sách danh mục để đổ vào ô chọn "Danh mục cha"
  const { rows: allCategories } = useList("danh-muc");

  // Hai ô cần nhớ giá trị bằng state: ô chọn cha và công tắc "Hiển thị"
  const [parentId, setParentId] = useState(row?.parent_id ?? "");
  const [status, setStatus] = useState(row ? !!row.status : true); // thêm mới thì mặc định bật

  const [error, setError] = useState(""); // lỗi Laravel trả về
  const [busy, setBusy] = useState(false); // đang gửi?

  // Chạy khi bấm "Lưu"
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // chặn trình duyệt tải lại trang
    setBusy(true);
    setError("");

    // Gom các ô trong form thành FormData (tên ô = thuộc tính name)
    const formData = new FormData(event.currentTarget);

    // Công tắc: Laravel cần "1" hoặc "0"
    formData.set("status", status ? "1" : "0");

    // Khi SỬA: Laravel chỉ hiểu PUT khi gửi dạng POST kèm _method=PUT
    if (row) formData.append("_method", "PUT");

    // Thêm mới -> /danh-muc      Sửa -> /danh-muc/{id}
    const url = row ? `${API}/danh-muc/${row.id}` : `${API}/danh-muc`;

    try {
      await callApi(url, { method: "POST", body: formData });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Danh mục cha: bỏ chính nó ra (không cho chọn nó làm cha của chính nó)
  const parentOptions = (allCategories ?? []).filter((c) => c.id !== row?.id);

  return (
    <Modal title={row ? "Chỉnh sửa danh mục" : "Thêm danh mục"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên danh mục" required wide>
            <input name="ten_danh_muc" defaultValue={row?.ten_danh_muc ?? ""} required className={inputClass} />
          </Field>

          <Field label="Danh mục cha (để trống nếu là mục gốc)" wide>
            <select name="parent_id" value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
              <option value="">— Chọn —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_danh_muc}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mô tả" wide>
            <textarea name="mo_ta" defaultValue={row?.mo_ta ?? ""} rows={3} className={inputClass} />
          </Field>

          <Field label="Hiển thị" wide>
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="h-5 w-5 accent-teal-600"
            />
          </Field>
        </div>

        <FormActions error={error} busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}
