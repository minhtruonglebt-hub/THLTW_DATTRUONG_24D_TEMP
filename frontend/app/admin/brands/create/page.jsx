"use client";

// Thêm thương hiệu -> /admin/brands/create
// Các ô khớp với ThuongHieuRequest.php bên Laravel:
//   ten_thuong_hieu (bắt buộc), logo (ảnh ≤ 2MB), mo_ta, status

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { Field, FormActions, inputClass } from "@/components/Form";

export default function CreateBrandPage() {
  const router = useRouter();
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("status", status ? "1" : "0");

    // Không chọn ảnh thì bỏ ô logo đi
    if (formData.get("logo").size === 0) formData.delete("logo");

    try {
      await callApi(`${API}/thuong-hieu`, { method: "POST", body: formData });
      alert("Thêm thương hiệu thành công");
      router.push("/admin/brands");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold text-slate-900">Thêm thương hiệu</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên thương hiệu" required wide>
            <input name="ten_thuong_hieu" required className={inputClass} />
          </Field>

          <Field label="Logo (ảnh ≤ 2MB)" wide>
            <input type="file" name="logo" accept="image/*" className={inputClass} />
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
