"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { API, RESOURCES, fetchList, type Row } from "@/lib/admin-config";
import { FORMS, type FormCfg } from "@/lib/admin-forms";

const flat = (j: Row) => (j.errors ? Object.values(j.errors).flat().join(" • ") : j.message ?? "Có lỗi xảy ra");
async function call(url: string, init: RequestInit) {
  const res = await fetch(url, { ...init, headers: { Accept: "application/json" } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(flat(j));
  return j;
}
const input = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

type Opts = Record<string, Row[]>;
const labelOf = (src: string, r: Row) => (src === "danh-muc" ? r.ten_danh_muc : r.ten_thuong_hieu);

function FormModal({ form, row, opts, onClose, onSaved }: { form: FormCfg; row?: Row; opts: Opts; onClose: () => void; onSaved: () => void }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr("");
    const el = e.currentTarget;
    const fd = new FormData(el);
    for (const f of form.fields) {
      if (f.type === "switch") fd.set(f.name, (el.elements.namedItem(f.name) as HTMLInputElement).checked ? "1" : "0");
      if (f.type === "file" && (fd.get(f.name) as File).size === 0) fd.delete(f.name);
    }
    if (row) fd.append("_method", "PUT"); // Laravel hiểu POST + _method=PUT (gửi được file)
    try {
      await call(`${API}/${form.path}${row ? `/${row.id}` : ""}`, { method: "POST", body: fd });
      onSaved();
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-6" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold">{row ? "Chỉnh sửa" : "Thêm mới"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {form.fields.map((f) => {
            const dv = f.type === "switch" ? (row ? !!row.status : true) : row?.[f.name] ?? "";
            const wide = f.type === "textarea" || f.type === "file" || f.type === "switch" ? "sm:col-span-2" : "";
            return (
              <label key={f.name} className={`flex flex-col gap-1 text-sm ${wide}`}>
                <span className="font-medium text-slate-600">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
                {f.type === "textarea" ? <textarea name={f.name} defaultValue={dv as string} rows={3} className={input} />
                : f.type === "select" ? (
                  <select name={f.name} defaultValue={dv as string} required={f.required} className={input}>
                    <option value="">— Chọn —</option>
                    {(opts[f.source!] ?? []).filter((o) => !(row && f.name === "parent_id" && o.id === row.id)).map((o) => (
                      <option key={o.id} value={o.id}>{labelOf(f.source!, o)}</option>
                    ))}
                  </select>
                ) : f.type === "file" ? <input type="file" name={f.name} accept="image/*" className={input} />
                : f.type === "switch" ? <input type="checkbox" name={f.name} defaultChecked={dv as boolean} className="h-5 w-5 accent-teal-600" />
                : <input type={f.type} name={f.name} defaultValue={dv as string} required={f.required} min={f.type === "number" ? 0 : undefined} className={input} />}
              </label>
            );
          })}
        </div>
        {err && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">Huỷ</button>
          <button disabled={busy} className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">{busy ? "Đang lưu…" : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}

export default function ResourcePage() {
  const { resource } = useParams<{ resource: string }>();
  const cfg = RESOURCES.find((r) => r.key === resource);
  const form = FORMS[resource];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [modal, setModal] = useState<{ row?: Row } | null>(null);
  const [opts, setOpts] = useState<Opts>({});

  const load = useCallback(() => {
    if (!cfg) return;
    fetchList(cfg.key).then(setRows).catch((e) => setNotice({ ok: false, text: `${e.message}. Kiểm tra Laravel đang chạy ở cổng 8000.` }));
  }, [cfg]);
  useEffect(() => { setRows(null); setNotice(null); load(); }, [load]);
  useEffect(() => {
    if (form) (["danh-muc", "thuong-hieu"] as const).forEach((k) => fetchList(k).then((d) => setOpts((o) => ({ ...o, [k]: d }))).catch(() => {}));
  }, [form]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => !s || JSON.stringify(r).toLowerCase().includes(s));
  }, [rows, q]);

  async function act(fn: () => Promise<unknown>, okText: string) {
    try { await fn(); setNotice({ ok: true, text: okText }); load(); }
    catch (e) { setNotice({ ok: false, text: (e as Error).message }); }
  }
  const remove = (r: Row) => confirm("Xoá mục này? Hành động không thể hoàn tác.") &&
    act(() => call(`${API}/${form.path}/${r.id}`, { method: "DELETE" }), "Đã xoá");
  const cancelOrder = (r: Row) => confirm(`Huỷ đơn ${r.ma_don_hang}?`) &&
    act(() => call(`${API}/don-hang/${r.id}/huy`, { method: "POST" }), "Đã huỷ đơn");

  if (!cfg) return <p>Không có mục này.</p>;
  const hasActions = !!form || cfg.key === "don-hang";
  const btn = "rounded-md px-2.5 py-1 text-xs font-medium";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.title}</h1>
          <p className="text-sm text-slate-500">{shown.length} bản ghi</p>
        </div>
        <div className="flex gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm…" className={`${input} w-64`} />
          {form && <button onClick={() => setModal({})} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700">+ Thêm mới</button>}
        </div>
      </div>

      {notice && <p className={`mb-4 rounded-lg p-3 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{notice.text}</p>}
      {!rows && !notice && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100/80 text-slate-600">
              <tr>
                {cfg.columns.map((c) => <th key={c.label} className="whitespace-nowrap px-4 py-3 font-medium">{c.label}</th>)}
                {hasActions && <th className="px-4 py-3 text-right font-medium">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id ?? i} className="border-t border-stone-100 align-middle even:bg-stone-50/50 hover:bg-teal-50/40">
                  {cfg.columns.map((c) => <td key={c.label} className="px-4 py-3">{c.render(r)}</td>)}
                  {hasActions && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {form && <>
                        <button onClick={() => setModal({ row: r })} className={`${btn} mr-2 bg-teal-50 text-teal-700 hover:bg-teal-100`}>Sửa</button>
                        <button onClick={() => remove(r)} className={`${btn} bg-red-50 text-red-600 hover:bg-red-100`}>Xoá</button>
                      </>}
                      {cfg.key === "don-hang" && r.trang_thai === "cho_xac_nhan" &&
                        <button onClick={() => cancelOrder(r)} className={`${btn} bg-amber-50 text-amber-700 hover:bg-amber-100`}>Huỷ đơn</button>}
                    </td>
                  )}
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={cfg.columns.length + 1} className="px-4 py-10 text-center text-slate-500">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && form && (
        <FormModal form={form} row={modal.row} opts={opts} onClose={() => setModal(null)}
          onSaved={() => { setModal(null); setNotice({ ok: true, text: "Đã lưu" }); load(); }} />
      )}
    </>
  );
}
