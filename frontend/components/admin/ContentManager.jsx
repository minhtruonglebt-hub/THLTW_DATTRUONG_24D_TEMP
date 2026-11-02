"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { date, mediaUrl } from "@/lib/format";
import { Field, FormActions, inputClass } from "@/components/Form";

const TYPES = {
  topics: {
    key: "chu-de-bai-viet", title: "Chủ đề bài viết", endpoint: "chu-de-bai-viet", name: "ten_chu_de",
    fields: ["ten_chu_de"],
  },
  posts: {
    key: "bai-viet", title: "Bài viết", endpoint: "bai-viet", name: "tieu_de",
    fields: ["chu_de_id", "tieu_de", "tom_tat", "noi_dung", "hinh_anh"],
  },
  pages: {
    key: "trang-don", title: "Trang tĩnh", endpoint: "trang-don", name: "tieu_de",
    fields: ["tieu_de", "noi_dung"],
  },
  menus: {
    key: "muc-menu", title: "Mục menu", endpoint: "muc-menu", name: "ten_menu",
    fields: ["ten_menu", "url", "parent_id", "thu_tu"],
  },
  banners: {
    key: "banner", title: "Banner", endpoint: "banner", name: "tieu_de",
    fields: ["tieu_de", "hinh_anh", "lien_ket", "thu_tu"],
  },
};

export default function ContentManager({ type, mode = "list" }) {
  const config = TYPES[type];
  const router = useRouter();
  const params = useParams();
  const { rows, error, loading, reload } = useList(config.key);
  const { rows: topics } = useList("chu-de-bai-viet");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const current = (rows ?? []).find((row) => String(row.id) === String(params?.id));
  const statusValue = status ?? (mode === "edit" && current ? Boolean(current.status) : true);
  const filtered = useMemo(() => (rows ?? []).filter((row) => {
    const matchesText = JSON.stringify(row).toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = !statusFilter || String(Boolean(row.status)) === statusFilter;
    return matchesText && matchesStatus;
  }), [rows, search, statusFilter]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!config) return <p>Không có mục nội dung này.</p>;

  if (mode === "list") {
    return (
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{filtered.length} bản ghi</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm kiếm…" className={`${inputClass} min-w-0 flex-1 sm:w-56`} />
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">Mọi trạng thái</option>
              <option value="true">Đang hiển thị</option>
              <option value="false">Đang ẩn</option>
            </select>
            <Link href={`/admin/${type}/create`} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">+ Thêm mới</Link>
          </div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>}
        {rows && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>
                <th className="px-4 py-3">Tên</th>
                {type === "posts" && <th className="px-4 py-3">Chủ đề</th>}
                {type === "banners" && <th className="px-4 py-3">Ảnh</th>}
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr></thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{row[config.name] || "(Chưa đặt tiêu đề)"}</td>
                    {type === "posts" && <td className="px-4 py-3">{row.chu_de?.ten_chu_de ?? "—"}</td>}
                    {type === "banners" && <td className="px-4 py-3">{mediaUrl(row.hinh_anh) && <Image src={mediaUrl(row.hinh_anh)} alt={row.tieu_de ?? "Banner"} width={80} height={48} unoptimized className="h-12 w-20 object-cover" />}</td>}
                    <td className="px-4 py-3">{row.status ? "Đang hiển thị" : "Đang ẩn"}</td>
                    <td className="px-4 py-3">{date(row.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/${type}/${row.id}`} className="mr-3 text-teal-700 hover:underline">Sửa</Link>
                      <button type="button" onClick={async () => {
                        if (!confirm(`Xóa "${row[config.name] || config.title}"?`)) return;
                        try {
                          await callApi(`${API}/admin/${config.endpoint}/${row.id}`, { method: "DELETE" });
                          reload();
                        } catch (cause) {
                          alert(cause instanceof Error ? cause.message : "Không xóa được.");
                        }
                      }} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && <tr><td colSpan={type === "posts" || type === "banners" ? 5 : 4} className="px-4 py-10 text-center text-slate-500">Không có dữ liệu phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {pageCount > 1 && <div className="mt-4 flex justify-center gap-3">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-2 disabled:opacity-40">← Trước</button>
          <span className="py-2">Trang {page}/{pageCount}</span>
          <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau →</button>
        </div>}
      </section>
    );
  }

  if (mode === "edit" && loading) return <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>;
  if (mode === "edit" && !current && rows) return <p className="text-sm text-slate-500">Không tìm thấy dữ liệu.</p>;

  const initial = current ?? {};
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    const data = new FormData(event.currentTarget);
    data.set("status", statusValue ? "1" : "0");
    if (type === "posts" && !data.get("chu_de_id")) {
      setFormError("Vui lòng chọn chủ đề bài viết.");
      setBusy(false);
      return;
    }
    if (type === "banners" && mode === "create" && !data.get("hinh_anh")?.size) {
      setFormError("Vui lòng chọn ảnh banner.");
      setBusy(false);
      return;
    }
    if (!data.get("hinh_anh")?.size) data.delete("hinh_anh");
    const endpoint = `${API}/admin/${config.endpoint}${mode === "edit" ? `/${initial.id}` : ""}`;
    try {
      if (mode === "edit" && type !== "posts" && type !== "banners") {
        const payload = Object.fromEntries(data.entries());
        payload.status = data.get("status") === "1";
        await callApi(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await callApi(endpoint, { method: "POST", body: data });
      }
      router.push(`/admin/${type}`);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không lưu được dữ liệu.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
      <Link href={`/admin/${type}`} className="text-sm text-teal-700 hover:underline">← {config.title}</Link>
      <h1 className="my-4 text-2xl font-bold">{mode === "create" ? `Thêm ${config.title.toLowerCase()}` : `Chỉnh sửa ${config.title.toLowerCase()}`}</h1>
      <form onSubmit={save} className="space-y-4">
        {config.fields.map((field) => {
          if (field === "chu_de_id") return <Field key={field} label="Chủ đề" required><select name={field} defaultValue={initial[field] ?? ""} className={inputClass} required><option value="">— Chọn chủ đề —</option>{(topics ?? []).map((topic) => <option key={topic.id} value={topic.id}>{topic.ten_chu_de}</option>)}</select></Field>;
          if (field === "noi_dung") return <Field key={field} label="Nội dung" wide><textarea name={field} defaultValue={initial[field] ?? ""} rows={10} className={inputClass} /></Field>;
          if (field === "tom_tat") return <Field key={field} label="Tóm tắt" wide><textarea name={field} defaultValue={initial[field] ?? ""} rows={3} className={inputClass} /></Field>;
          if (field === "hinh_anh") return <Field key={field} label={type === "banners" ? "Ảnh banner (tối đa 4MB)" : "Ảnh đại diện (tối đa 4MB)"} wide>
            {initial.hinh_anh && <Image src={mediaUrl(initial.hinh_anh)} alt="" width={240} height={120} unoptimized className="mb-2 h-28 w-60 object-cover" />}
            <input type="file" name={field} accept="image/*" required={type === "banners" && mode === "create"} className={inputClass} />
          </Field>;
          if (field === "thu_tu") return <Field key={field} label="Thứ tự"><input name={field} type="number" min="0" defaultValue={initial[field] ?? 0} className={inputClass} /></Field>;
          if (field === "parent_id") return <Field key={field} label="Mục cha"><select name={field} defaultValue={initial[field] ?? ""} className={inputClass}><option value="">— Không có —</option>{(rows ?? []).filter((row) => row.id !== initial.id).map((row) => <option key={row.id} value={row.id}>{row.ten_menu}</option>)}</select></Field>;
          if (field === "url" || field === "lien_ket") return <Field key={field} label="Đường dẫn"><input name={field} defaultValue={initial[field] ?? ""} className={inputClass} /></Field>;
          return <Field key={field} label={field === "ten_chu_de" ? "Tên chủ đề" : "Tiêu đề"} required><input name={field} defaultValue={initial[field] ?? ""} required className={inputClass} /></Field>;
        })}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={statusValue} onChange={(event) => setStatus(event.target.checked)} /> Hiển thị</label>
        <FormActions error={formError} busy={busy} onClose={() => router.back()} />
      </form>
    </div>
  );
}
