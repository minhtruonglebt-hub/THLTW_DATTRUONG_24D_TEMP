"use client";

// =====================================================================
// FORM THÊM / SỬA THƯƠNG HIỆU (hiện dạng hộp nổi)
//
//   row = null  -> THÊM MỚI        row = {...} -> SỬA
//
// Các ô khớp với ThuongHieuRequest.php bên Laravel:
//   ten_thuong_hieu (bắt buộc), logo (ảnh ≤ 2MB), mo_ta, status
// =====================================================================

import { useState } from "react";
import { API, callApi, type Row } from "@/lib/api";
import { Modal, Field, FormActions, inputClass } from "../../components/Form";

type Props = {
  row: Row | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ThuongHieuForm({ row, onClose, onSaved }: Props) {
  const [status, setStatus] = useState(row ? !!row.status : true); // thêm mới thì mặc định bật
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    // FormData gom cả chữ lẫn file ảnh trong form
    const formData = new FormData(event.currentTarget);
    formData.set("status", status ? "1" : "0");

    // Không chọn ảnh mới thì bỏ ô logo đi, để Laravel giữ nguyên logo cũ
    const logo = formData.get("logo") as File;
    if (logo.size === 0) formData.delete("logo");

    // Khi SỬA: gửi POST kèm _method=PUT (cách duy nhất để gửi được file với PUT)
    if (row) formData.append("_method", "PUT");

    const url = row ? `${API}/thuong-hieu/${row.id}` : `${API}/thuong-hieu`;

    try {
      await callApi(url, { method: "POST", body: formData });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={row ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên thương hiệu" required wide>
            <input name="ten_thuong_hieu" defaultValue={row?.ten_thuong_hieu ?? ""} required className={inputClass} />
          </Field>

          <Field label="Logo (ảnh ≤ 2MB)" wide>
            <input type="file" name="logo" accept="image/*" className={inputClass} />
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
