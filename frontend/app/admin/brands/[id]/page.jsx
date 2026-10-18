"use client";

// Sửa thương hiệu -> /admin/brands/{id}

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";
import Thumb from "@/components/Thumb";

export default function EditBrandPage() {
  const { id } = useParams();
  const { rows, error, loading } = useList("thuong-hieu");

  if (loading) return <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>;
  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;

  const brand = (rows ?? []).find((r) => String(r.id) === String(id));
  if (!brand) return <p className="text-sm text-slate-500">Không tìm thấy thương hiệu.</p>;

  return <EditBrandForm brand={brand} />;
}

function EditBrandForm({ brand }) {
  const router = useRouter();
  const [status, setStatus] = useState(!!brand.status);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");

    // Không chọn ảnh mới thì bỏ ô logo đi, để Laravel giữ nguyên logo cũ
    if (formData.get("logo").size === 0) formData.delete("logo");

    formData.append("_method", "PUT"); // gửi file thì phải POST kèm _method=PUT

    try {
      await callApi(`${API}/thuong-hieu/${brand.id}`, { method: "POST", body: formData });
      alert("Cập nhật thương hiệu thành công");
      router.push("/admin/brands");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Chỉnh sửa thương hiệu</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên thương hiệu" required wide>
            <input name="ten_thuong_hieu" defaultValue={brand.ten_thuong_hieu ?? ""} required className={inputClass} />
          </Field>

          <Field label="Logo (ảnh ≤ 2MB) — chọn ảnh mới nếu muốn thay" wide>
            <div className="flex items-center gap-3">
              <Thumb src={brand.logo_url} className="h-12 w-12 object-contain" />
              <input type="file" name="logo" accept="image/*" className={inputClass} />
            </div>
          </Field>

          <Field label="Mô tả" wide>
            <textarea name="mo_ta" defaultValue={brand.mo_ta ?? ""} rows={3} className={inputClass} />
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
