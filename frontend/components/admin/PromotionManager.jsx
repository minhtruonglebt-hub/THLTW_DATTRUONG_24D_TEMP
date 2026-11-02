"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API, callApi, useList } from "@/lib/api";
import { date, money } from "@/lib/format";
import { Field, FormActions, inputClass } from "@/components/Form";

function toLocalDateTime(value) {
  if (!value) return "";
  const parsed = new Date(value);
  const offset = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
}

export default function PromotionManager({ mode = "list" }) {
  const router = useRouter();
  const { id } = useParams();
  const { rows, error, loading, reload } = useList("khuyen-mai");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const current = (rows ?? []).find((row) => String(row.id) === String(id));
  const filtered = useMemo(() => (rows ?? []).filter((row) => {
    const matchesText = `${row.ma_khuyen_mai} ${row.ten_khuyen_mai}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesText && (!statusFilter || String(Boolean(row.status)) === statusFilter);
  }), [rows, search, statusFilter]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (mode === "list") {
    return (
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Mã khuyến mãi</h1><p className="mt-1 text-sm text-slate-500">{filtered.length} mã</p></div>
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm mã / tên…" className={inputClass} />
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">Mọi trạng thái</option><option value="true">Đang bật</option><option value="false">Đang tắt</option>
            </select>
            <Link href="/admin/promotions/create" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">+ Thêm mã</Link>
          </div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-sm text-slate-500">Đang tải mã khuyến mãi...</p>}
        {rows && <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>{["Mã", "Tên", "Giảm", "Điều kiện", "Lượt dùng", "Thời hạn", "Trạng thái", "Thao tác"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead>
          <tbody>{visible.map((row) => <tr key={row.id} className="border-t">
            <td className="px-3 py-3 font-semibold">{row.ma_khuyen_mai}</td><td className="px-3 py-3">{row.ten_khuyen_mai}</td>
            <td className="px-3 py-3">{row.loai_giam === "phan_tram" ? `${row.gia_tri_giam}%` : money(row.gia_tri_giam)}</td>
            <td className="px-3 py-3">Đơn từ {money(row.don_toi_thieu)}</td>
            <td className="px-3 py-3">{row.da_su_dung ?? 0}/{row.so_lan_su_dung ?? "∞"}</td>
            <td className="px-3 py-3">{date(row.ngay_bat_dau)} – {date(row.ngay_ket_thuc)}</td>
            <td className="px-3 py-3">{row.status ? "Đang bật" : "Đang tắt"}</td>
            <td className="whitespace-nowrap px-3 py-3 text-right"><Link href={`/admin/promotions/${row.id}`} className="mr-3 text-teal-700 hover:underline">Sửa</Link>
              <button type="button" className="text-red-600 hover:underline" onClick={async () => {
                if (!confirm(`Xóa mã ${row.ma_khuyen_mai}?`)) return;
                try { await callApi(`${API}/admin/khuyen-mai/${row.id}`, { method: "DELETE" }); reload(); }
                catch (cause) { alert(cause instanceof Error ? cause.message : "Không xóa được mã."); }
              }}>Xóa</button></td>
          </tr>)}{visible.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">Không có mã khuyến mãi.</td></tr>}</tbody>
        </table></div>}
        {pageCount > 1 && <div className="mt-4 flex justify-center gap-3"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-2 disabled:opacity-40">← Trước</button><span className="py-2">Trang {page}/{pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau →</button></div>}
      </section>
    );
  }

  if (mode === "edit" && loading) return <p>Đang tải mã khuyến mãi...</p>;
  if (mode === "edit" && !current && rows) return <p>Không tìm thấy mã khuyến mãi.</p>;
  const formRow = current ?? {};

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    data.status = form.get("status") === "on";
    data.so_lan_su_dung = data.so_lan_su_dung === "" ? null : Number(data.so_lan_su_dung);
    data.don_toi_thieu = Number(data.don_toi_thieu || 0);
    data.gia_tri_giam = Number(data.gia_tri_giam);
    try {
      await callApi(`${API}/admin/khuyen-mai${mode === "edit" ? `/${formRow.id}` : ""}`, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/admin/promotions");
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không lưu được mã.");
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
    <Link href="/admin/promotions" className="text-sm text-teal-700 hover:underline">← Mã khuyến mãi</Link>
    <h1 className="my-4 text-2xl font-bold">{mode === "create" ? "Tạo mã khuyến mãi" : "Cập nhật mã khuyến mãi"}</h1>
    <form onSubmit={save} className="space-y-4">
      <Field label="Mã khuyến mãi" required><input name="ma_khuyen_mai" required maxLength={50} defaultValue={formRow.ma_khuyen_mai ?? ""} className={inputClass} /></Field>
      <Field label="Tên chương trình" required><input name="ten_khuyen_mai" required defaultValue={formRow.ten_khuyen_mai ?? ""} className={inputClass} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Loại giảm"><select name="loai_giam" defaultValue={formRow.loai_giam ?? "phan_tram"} className={inputClass}><option value="phan_tram">Phần trăm</option><option value="so_tien">Số tiền</option></select></Field>
        <Field label="Giá trị giảm" required><input name="gia_tri_giam" type="number" min="0.01" step="0.01" required defaultValue={formRow.gia_tri_giam ?? ""} className={inputClass} /></Field>
        <Field label="Đơn tối thiểu (₫)"><input name="don_toi_thieu" type="number" min="0" step="1000" defaultValue={formRow.don_toi_thieu ?? 0} className={inputClass} /></Field>
        <Field label="Giới hạn lượt dùng (để trống = không giới hạn)"><input name="so_lan_su_dung" type="number" min="1" defaultValue={formRow.so_lan_su_dung ?? ""} className={inputClass} /></Field>
        <Field label="Bắt đầu" required><input name="ngay_bat_dau" type="datetime-local" required defaultValue={toLocalDateTime(formRow.ngay_bat_dau)} className={inputClass} /></Field>
        <Field label="Kết thúc" required><input name="ngay_ket_thuc" type="datetime-local" required defaultValue={toLocalDateTime(formRow.ngay_ket_thuc)} className={inputClass} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input name="status" type="checkbox" defaultChecked={formRow.status ?? true} /> Đang áp dụng</label>
      <FormActions error={formError} busy={busy} onClose={() => router.back()} />
    </form>
  </div>;
}
