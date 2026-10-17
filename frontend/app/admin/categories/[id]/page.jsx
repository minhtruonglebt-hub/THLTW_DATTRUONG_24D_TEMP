"use client";

// Sửa danh mục -> /admin/categories/{id}
// Backend chưa có API "lấy 1 danh mục theo id", nên lấy cả danh sách rồi tìm dòng có id tương ứng.

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";

export default function EditCategoryPage() {
  const { id } = useParams();
  const { rows, error, loading } = useList("danh-muc");

  if (loading) return <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>;
  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;

  const category = (rows ?? []).find((r) => String(r.id) === String(id));
  if (!category) return <p className="text-sm text-slate-500">Không tìm thấy danh mục.</p>;

  return <EditCategoryForm category={category} allCategories={rows ?? []} />;
}

function EditCategoryForm({ category, allCategories }) {
  const router = useRouter();
  const [parentId, setParentId] = useState(category.parent_id ?? "");
  const [status, setStatus] = useState(!!category.status);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Không cho chọn chính nó làm cha của chính nó
  const parentOptions = allCategories.filter((c) => c.id !== category.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");
    formData.append("_method", "PUT"); // Laravel chỉ hiểu PUT khi gửi POST kèm _method=PUT

    try {
      await callApi(`${API}/danh-muc/${category.id}`, { method: "POST", body: formData });
      alert("Cập nhật danh mục thành công");
      router.push("/admin/categories");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Chỉnh sửa danh mục</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên danh mục" required wide>
            <input name="ten_danh_muc" defaultValue={category.ten_danh_muc ?? ""} required className={inputClass} />
          </Field>

          <Field label="Danh mục cha (để trống nếu là mục gốc)" wide>
            <select
              name="parent_id"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Chọn —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_danh_muc}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mô tả" wide>
            <textarea name="mo_ta" defaultValue={category.mo_ta ?? ""} rows={3} className={inputClass} />
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
