"use client";

// Thêm danh mục -> /admin/categories/create
// Các ô khớp với DanhMucRequest.php bên Laravel:
//   ten_danh_muc (bắt buộc), parent_id, mo_ta, status

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { rows: allCategories } = useList("danh-muc"); // đổ vào ô "Danh mục cha"
  const [parentId, setParentId] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");

    try {
      await callApi(`${API}/danh-muc`, { method: "POST", body: formData });
      alert("Thêm danh mục thành công");
      router.push("/admin/categories");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Thêm danh mục</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên danh mục" required wide>
            <input name="ten_danh_muc" required className={inputClass} />
          </Field>

          <Field label="Danh mục cha (để trống nếu là mục gốc)" wide>
            <select
              name="parent_id"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Chọn —</option>
              {(allCategories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ten_danh_muc}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mô tả" wide>
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
