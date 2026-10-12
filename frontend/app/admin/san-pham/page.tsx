"use client";

// =====================================================================
// TRANG SẢN PHẨM  ->  mở bằng đường link /admin/san-pham
//
// Toàn bộ chức năng nằm trong file này:
//   1. Xem danh sách (ảnh, giá, tồn kho...)    2. Tìm kiếm
//   3. Thêm / Sửa (hộp nổi)                    4. Xoá
// =====================================================================

import { useState } from "react";
import { API, callApi, useList, type Row } from "@/lib/api";
import { money } from "@/lib/format";

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const th = "whitespace-nowrap px-4 py-3 font-medium"; // ô tiêu đề cột
const td = "px-4 py-3"; // ô dữ liệu

export default function SanPhamPage() {
  // ---------- 1. DỮ LIỆU ----------
  const { rows, error, reload } = useList("san-pham");
  const { rows: categories } = useList("danh-muc"); // để đổ vào ô chọn "Danh mục"
  const { rows: brands } = useList("thuong-hieu"); // để đổ vào ô chọn "Thương hiệu"

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // ---------- 2. TÌM KIẾM ----------
  // Giữ lại những dòng có (ID + tên + slug + danh mục + thương hiệu) chứa từ khoá.
  const keyword = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r) =>
    `${r.id} ${r.ten_san_pham} ${r.slug} ${r.danh_muc?.ten_danh_muc} ${r.thuong_hieu?.name}`.toLowerCase().includes(keyword)
  );

  // ---------- 3. THÊM / SỬA ----------
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null); // null = đang thêm mới
  const [categoryId, setCategoryId] = useState(""); // danh mục được chọn
  const [brandId, setBrandId] = useState(""); // thương hiệu được chọn
  const [status, setStatus] = useState(true); // công tắc "Hiển thị"
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setCategoryId("");
    setBrandId("");
    setStatus(true);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setCategoryId(row.danh_muc_id ?? "");
    setBrandId(row.thuong_hieu_id ?? "");
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

    // Không chọn ảnh mới thì bỏ ô hinh_anh đi, để Laravel giữ nguyên ảnh cũ
    const image = formData.get("hinh_anh") as File;
    if (image.size === 0) formData.delete("hinh_anh");

    if (editing) formData.append("_method", "PUT"); // sửa: gửi POST kèm _method=PUT

    const url = editing ? `${API}/san-pham/${editing.id}` : `${API}/san-pham`;

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
      await callApi(`${API}/san-pham/${row.id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-semibold">Sản phẩm</h1>
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
                <th className={th}>Ảnh</th>
                <th className={th}>Tên sản phẩm</th>
                <th className={th}>Danh mục</th>
                <th className={th}>Thương hiệu</th>
                <th className={th}>Giá</th>
                <th className={th}>Giá KM</th>
                <th className={th}>Tồn kho</th>
                <th className={th}>Lượt xem</th>
                <th className={th}>Trạng thái</th>
                <th className={`${th} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-stone-100 hover:bg-teal-50/40">
                  <td className={td}>{r.id}</td>
                  <td className={td}>
                    {r.hinh_anh_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.hinh_anh_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={td}>{r.ten_san_pham}</td>
                  <td className={td}>{r.danh_muc?.ten_danh_muc ?? r.danh_muc_id}</td>
                  <td className={td}>{r.thuong_hieu?.name ?? r.thuong_hieu_id}</td>
                  <td className={td}>{money(r.gia)}</td>
                  <td className={td}>{money(r.gia_khuyen_mai)}</td>
                  <td className={td}>
                    {/* Hết hàng (0) thì tô đỏ cho dễ thấy */}
                    <span className={r.so_luong === 0 ? "font-semibold text-red-600" : ""}>{r.so_luong}</span>
                  </td>
                  <td className={td}>{r.luot_xem ?? "—"}</td>
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
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
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
            <h2 className="mb-5 text-lg font-semibold">{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2>

            <div className="flex flex-col gap-4 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </span>
                <input name="ten_san_pham" defaultValue={editing?.ten_san_pham ?? ""} required className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">
                  Danh mục <span className="text-red-500">*</span>
                </span>
                <select name="danh_muc_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputClass}>
                  <option value="">— Chọn —</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ten_danh_muc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">
                  Thương hiệu <span className="text-red-500">*</span>
                </span>
                <select name="thuong_hieu_id" value={brandId} onChange={(e) => setBrandId(e.target.value)} required className={inputClass}>
                  <option value="">— Chọn —</option>
                  {(brands ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.ten_thuong_hieu}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">
                  Giá (₫) <span className="text-red-500">*</span>
                </span>
                <input type="number" name="gia" defaultValue={editing?.gia ?? ""} min={0} required className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Giá khuyến mãi (₫)</span>
                <input type="number" name="gia_khuyen_mai" defaultValue={editing?.gia_khuyen_mai ?? ""} min={0} className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Tồn kho</span>
                <input type="number" name="so_luong" defaultValue={editing?.so_luong ?? ""} min={0} className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Ảnh đại diện (≤ 2MB)</span>
                <input type="file" name="hinh_anh" accept="image/*" className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Mô tả ngắn</span>
                <textarea name="mo_ta_ngan" defaultValue={editing?.mo_ta_ngan ?? ""} rows={2} className={inputClass} />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-slate-600">Mô tả chi tiết</span>
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
