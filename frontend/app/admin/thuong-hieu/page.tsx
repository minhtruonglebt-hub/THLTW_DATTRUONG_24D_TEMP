"use client";

// =====================================================================
// TRANG THƯƠNG HIỆU  ->  mở bằng đường link /admin/thuong-hieu
//
// Toàn bộ chức năng nằm trong file này:
//   1. Xem danh sách (có logo)    2. Tìm kiếm    3. Thêm / Sửa (hộp nổi)    4. Xoá
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const th = "whitespace-nowrap px-4 py-3 font-medium"; // ô tiêu đề cột
const td = "px-4 py-3"; // ô dữ liệu

export default function ThuongHieuPage() {
  // ---------- 1. DỮ LIỆU ----------
  const { rows, error, reload } = useList("thuong-hieu");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // ---------- 2. TÌM KIẾM ----------
  // Giữ lại những dòng có (ID + tên + slug) chứa từ khoá. Bỏ qua chữ hoa/thường.
  const keyword = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r) => `${r.id} ${r.ten_thuong_hieu} ${r.slug}`.toLowerCase().includes(keyword));

  // ---------- 3. THÊM / SỬA ----------
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null); // null = đang thêm mới
  const [status, setStatus] = useState(true); // công tắc "Hiển thị"
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setStatus(true);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setStatus(!!row.status);
    setFormError("");
    setShowForm(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const formData = new FormData(event.currentTarget); // gom cả chữ lẫn file ảnh
    formData.set("status", status ? "1" : "0");

    // Không chọn ảnh mới thì bỏ ô logo đi, để Laravel giữ nguyên logo cũ
    const logo = formData.get("logo") as File;
    if (logo.size === 0) formData.delete("logo");

    if (editing) formData.append("_method", "PUT"); // sửa: gửi POST kèm _method=PUT

    const url = editing ? `${API}/thuong-hieu/${editing.id}` : `${API}/thuong-hieu`;

    try {
      await callApi(url, { method: "POST", body: formData });
      setShowForm(false);
      setNotice({ ok: true, text: "Đã lưu" });
      reload();
    } catch (e) {
      setFormError((e as Error).message);
      setSaving(false);
    }
  }

  // ---------- 4. XOÁ ----------
  async function handleDelete(row: Row) {
    if (!confirm("Xoá mục này? Hành động không thể hoàn tác.")) return;
    try {
      await callApi(`${API}/thuong-hieu/${row.id}`, { method: "DELETE" });
      setNotice({ ok: true, text: "Đã xoá" });
      reload();
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }

  // ---------- GIAO DIỆN ----------
  return (
    <>
      {/* Đầu trang: tiêu đề, ô tìm kiếm, nút thêm */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Thương hiệu</h1>
          <p className="text-sm text-slate-500">{list.length} bản ghi</p>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm…"
            className={`${inputClass} w-64`}
          />
          <button onClick={openAdd} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            + Thêm mới
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className={`mb-4 rounded-lg p-3 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
          {notice.text}
        </p>
      )}
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {/* Bảng danh sách */}
      {rows && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-slate-600">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Logo</th>
                <th className={th}>Tên thương hiệu</th>
                <th className={th}>Slug</th>
                <th className={th}>Trạng thái</th>
                <th className={`${th} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 hover:bg-teal-50/40">
                  <td className={td}>{r.id}</td>
                  <td className={td}>
                    {/* Có logo thì hiện ảnh, không có thì hiện dấu "—" */}
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logo_url} alt="" className="h-8 w-8 rounded object-contain" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={td}>{r.ten_thuong_hieu}</td>
                  <td className={td}>{r.slug ?? "—"}</td>
                  <td className={td}>
                    {r.status ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Hiển thị</span>
                    ) : (
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Ẩn</span>
                    )}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <button onClick={() => openEdit(r)} className="mr-2 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(r)} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hộp nổi thêm / sửa. Bấm ra ngoài vùng trắng thì đóng. */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-6"
          onMouseDown={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSave}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-5 text-lg font-semibold">{editing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}</h2>

            <div className="flex flex-col gap-4 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </span>
                <input name="ten_thuong_hieu" defaultValue={editing?.ten_thuong_hieu ?? ""} required className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Logo (ảnh ≤ 2MB)</span>
                <input type="file" name="logo" accept="image/*" className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Mô tả</span>
                <textarea name="mo_ta" defaultValue={editing?.mo_ta ?? ""} rows={3} className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Hiển thị</span>
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="h-5 w-5 accent-teal-600"
                />
              </label>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">
                Huỷ
              </button>
              <button disabled={saving} className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
