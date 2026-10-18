"use client";

// Thêm sản phẩm -> /admin/products/create
// Các ô khớp với SanPhamRequest.php bên Laravel:
//   ten_san_pham, danh_muc_id, thuong_hieu_id, gia (bắt buộc)
//   gia_khuyen_mai, so_luong, hinh_anh (ảnh ≤ 2MB), mo_ta_ngan, mo_ta, status

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";

export default function CreateProductPage() {
  const router = useRouter();
  const { rows: categories } = useList("danh-muc");
  const { rows: brands } = useList("thuong-hieu");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");
    if (formData.get("hinh_anh").size === 0) formData.delete("hinh_anh");

    try {
      await callApi(`${API}/san-pham`, { method: "POST", body: formData });
      alert("Thêm sản phẩm thành công");
      router.push("/admin/products");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Thêm sản phẩm</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên sản phẩm" required>
            <input name="ten_san_pham" required className={inputClass} />
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
            <input type="number" name="gia" min={0} required className={inputClass} />
          </Field>

          <Field label="Giá khuyến mãi (₫)">
            <input type="number" name="gia_khuyen_mai" min={0} className={inputClass} />
          </Field>

          <Field label="Tồn kho">
            <input type="number" name="so_luong" min={0} className={inputClass} />
          </Field>

          <Field label="Ảnh đại diện (≤ 2MB)" wide>
            <input type="file" name="hinh_anh" accept="image/*" className={inputClass} />
          </Field>

          <Field label="Mô tả ngắn" wide>
            <textarea name="mo_ta_ngan" rows={3} className={inputClass} />
          </Field>

          <Field label="Mô tả chi tiết" wide>
            <textarea name="mo_ta" rows={3} className={inputClass} />
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

        <FormActions error={error} busy={busy} onClose={() => router.back()} />
      </form>
    </div>
  );
}
