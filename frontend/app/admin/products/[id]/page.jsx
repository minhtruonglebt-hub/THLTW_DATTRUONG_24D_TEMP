"use client";

// Sửa sản phẩm -> /admin/products/{id}

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";
import Thumb from "@/components/Thumb";

export default function EditProductPage() {
  const { id } = useParams();
  const { rows, error, loading } = useList("san-pham");

  if (loading) return <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>;
  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;

  const product = (rows ?? []).find((r) => String(r.id) === String(id));
  if (!product) return <p className="text-sm text-slate-500">Không tìm thấy sản phẩm.</p>;

  return <EditProductForm product={product} />;
}

function EditProductForm({ product }) {
  const router = useRouter();
  const { rows: categories } = useList("danh-muc");
  const { rows: brands } = useList("thuong-hieu");
  const [categoryId, setCategoryId] = useState(product.danh_muc_id ?? "");
  const [brandId, setBrandId] = useState(product.thuong_hieu_id ?? "");
  const [status, setStatus] = useState(!!product.status);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");

    // Không chọn ảnh mới thì bỏ ô hinh_anh đi, để Laravel giữ nguyên ảnh cũ
    if (formData.get("hinh_anh").size === 0) formData.delete("hinh_anh");

    formData.append("_method", "PUT");

    try {
      await callApi(`${API}/san-pham/${product.id}`, { method: "POST", body: formData });
      alert("Cập nhật sản phẩm thành công");
      router.push("/admin/products");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Chỉnh sửa sản phẩm</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên sản phẩm" required>
            <input name="ten_san_pham" defaultValue={product.ten_san_pham ?? ""} required className={inputClass} />
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
            <input type="number" name="gia" defaultValue={product.gia ?? ""} min={0} required className={inputClass} />
          </Field>

          <Field label="Giá khuyến mãi (₫)">
            <input type="number" name="gia_khuyen_mai" defaultValue={product.gia_khuyen_mai ?? ""} min={0} className={inputClass} />
          </Field>

          <Field label="Tồn kho">
            <input type="number" name="so_luong" defaultValue={product.so_luong ?? ""} min={0} className={inputClass} />
          </Field>

          <Field label="Ảnh đại diện (≤ 2MB) — chọn ảnh mới nếu muốn thay" wide>
            <div className="flex items-center gap-3">
              <Thumb src={product.hinh_anh_url} className="h-12 w-12 object-cover" />
              <input type="file" name="hinh_anh" accept="image/*" className={inputClass} />
            </div>
          </Field>

          <Field label="Mô tả ngắn" wide>
            <textarea name="mo_ta_ngan" defaultValue={product.mo_ta_ngan ?? ""} rows={3} className={inputClass} />
          </Field>

          <Field label="Mô tả chi tiết" wide>
            <textarea name="mo_ta" defaultValue={product.mo_ta ?? ""} rows={3} className={inputClass} />
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
