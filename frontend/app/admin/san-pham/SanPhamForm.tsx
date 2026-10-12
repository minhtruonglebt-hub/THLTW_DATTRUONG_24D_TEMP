"use client";

// =====================================================================
// FORM THÊM / SỬA SẢN PHẨM (hiện dạng hộp nổi)
//
//   row = null  -> THÊM MỚI        row = {...} -> SỬA
//
// Các ô khớp với SanPhamRequest.php bên Laravel:
//   ten_san_pham, danh_muc_id, thuong_hieu_id, gia (bắt buộc)
//   gia_khuyen_mai, so_luong, hinh_anh (ảnh ≤ 2MB), mo_ta_ngan, mo_ta, status
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { Modal, Field, FormActions, inputClass } from "../../components/Form";

type Props = {
  row: Row | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function SanPhamForm({ row, onClose, onSaved }: Props) {
  // Hai danh sách để đổ vào ô chọn "Danh mục" và "Thương hiệu"
  const { rows: categories } = useList("danh-muc");
  const { rows: brands } = useList("thuong-hieu");

  // Các ô cần nhớ giá trị bằng state: 2 ô chọn và công tắc "Hiển thị"
  const [categoryId, setCategoryId] = useState(row?.danh_muc_id ?? "");
  const [brandId, setBrandId] = useState(row?.thuong_hieu_id ?? "");
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

    // Không chọn ảnh mới thì bỏ ô hinh_anh đi, để Laravel giữ nguyên ảnh cũ
    const image = formData.get("hinh_anh") as File;
    if (image.size === 0) formData.delete("hinh_anh");

    // Khi SỬA: gửi POST kèm _method=PUT (cách duy nhất để gửi được file với PUT)
    if (row) formData.append("_method", "PUT");

    const url = row ? `${API}/san-pham/${row.id}` : `${API}/san-pham`;

    try {
      await callApi(url, { method: "POST", body: formData });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={row ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên sản phẩm" required>
            <input name="ten_san_pham" defaultValue={row?.ten_san_pham ?? ""} required className={inputClass} />
          </Field>

          <Field label="Danh mục" required>
            <select
              name="danh_muc_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">— Chọn —</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_danh_muc}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Thương hiệu" required>
            <select
              name="thuong_hieu_id"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">— Chọn —</option>
              {(brands ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.ten_thuong_hieu}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Giá (₫)" required>
            <input type="number" name="gia" defaultValue={row?.gia ?? ""} min={0} required className={inputClass} />
          </Field>

          <Field label="Giá khuyến mãi (₫)">
            <input type="number" name="gia_khuyen_mai" defaultValue={row?.gia_khuyen_mai ?? ""} min={0} className={inputClass} />
          </Field>

          <Field label="Tồn kho">
            <input type="number" name="so_luong" defaultValue={row?.so_luong ?? ""} min={0} className={inputClass} />
          </Field>

          <Field label="Ảnh đại diện (≤ 2MB)" wide>
            <input type="file" name="hinh_anh" accept="image/*" className={inputClass} />
          </Field>

          <Field label="Mô tả ngắn" wide>
            <textarea name="mo_ta_ngan" defaultValue={row?.mo_ta_ngan ?? ""} rows={3} className={inputClass} />
          </Field>

          <Field label="Mô tả chi tiết" wide>
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
