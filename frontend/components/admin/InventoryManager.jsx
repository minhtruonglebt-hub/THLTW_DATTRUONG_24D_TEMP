"use client";

import { useMemo, useState } from "react";
import { API, callApi, useList } from "@/lib/api";
import { date } from "@/lib/format";
import { inputClass } from "@/components/Form";

export default function InventoryManager() {
  const { rows: slips, error, loading, reload } = useList("phieu-kho");
  const { rows: products } = useList("san-pham");
  const [type, setType] = useState("nhap");
  const [items, setItems] = useState([{ san_pham_id: "", so_luong: "1", don_gia: "0" }]);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const filtered = useMemo(() => (slips ?? []).filter((slip) => {
    return (!filterType || slip.loai_phieu === filterType)
      && `${slip.ma_phieu} ${slip.ghi_chu ?? ""}`.toLowerCase().includes(search.toLowerCase());
  }), [slips, filterType, search]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const payload = {
        loai_phieu: type,
        ghi_chu: note || null,
        items: items.map((item) => ({
          san_pham_id: Number(item.san_pham_id),
          so_luong: Number(item.so_luong),
          don_gia: Number(item.don_gia || 0),
        })),
      };
      await callApi(`${API}/admin/phieu-kho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setNotice("Đã tạo phiếu kho và cập nhật tồn kho.");
      setItems([{ san_pham_id: "", so_luong: "1", don_gia: "0" }]);
      setNote("");
      reload();
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Không tạo được phiếu kho.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-6">
    <div><h1 className="text-2xl font-bold">Quản lý kho</h1><p className="mt-1 text-sm text-slate-600">Tạo phiếu nhập/xuất; tồn kho chỉ thay đổi khi phiếu được ghi nhận thành công.</p></div>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Tạo phiếu kho</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">Loại phiếu<select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}><option value="nhap">Nhập kho (tăng tồn)</option><option value="xuat">Xuất kho (giảm tồn)</option></select></label>
        <label className="flex flex-col gap-1 text-sm">Ghi chú<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} className={inputClass} placeholder="Lý do nhập/xuất, nhà cung cấp..." /></label>
      </div>
      {items.map((item, index) => <div key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_130px_160px_auto]">
        <label className="flex flex-col gap-1 text-sm">Sản phẩm<select required value={item.san_pham_id} onChange={(event) => setItems((old) => old.map((row, i) => i === index ? { ...row, san_pham_id: event.target.value } : row))} className={inputClass}><option value="">— Chọn —</option>{(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.ten_san_pham} (tồn {product.so_luong})</option>)}</select></label>
        <label className="flex flex-col gap-1 text-sm">Số lượng<input required type="number" min="1" value={item.so_luong} onChange={(event) => setItems((old) => old.map((row, i) => i === index ? { ...row, so_luong: event.target.value } : row))} className={inputClass} /></label>
        <label className="flex flex-col gap-1 text-sm">Đơn giá nhập (₫)<input type="number" min="0" value={item.don_gia} onChange={(event) => setItems((old) => old.map((row, i) => i === index ? { ...row, don_gia: event.target.value } : row))} className={inputClass} /></label>
        <button type="button" disabled={items.length === 1} onClick={() => setItems((old) => old.filter((_, i) => i !== index))} className="self-end rounded-lg px-3 py-2 text-sm text-red-600 disabled:opacity-40">Xóa dòng</button>
      </div>)}
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setItems((old) => [...old, { san_pham_id: "", so_luong: "1", don_gia: "0" }])} className="rounded-lg border px-3 py-2 text-sm">+ Thêm sản phẩm</button><button type="submit" disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang ghi nhận..." : "Ghi nhận phiếu"}</button></div>
      {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
    </form>
    <div className="flex flex-wrap gap-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã phiếu / ghi chú…" className={inputClass} /><select value={filterType} onChange={(event) => setFilterType(event.target.value)} className={inputClass}><option value="">Tất cả phiếu</option><option value="nhap">Phiếu nhập</option><option value="xuat">Phiếu xuất</option></select></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading && <p className="text-sm text-slate-500">Đang tải lịch sử kho...</p>}
    {slips && <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm">
      <thead className="bg-slate-50"><tr>{["Mã phiếu", "Loại", "Sản phẩm", "Ghi chú", "Người tạo", "Thời gian"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead>
      <tbody>{filtered.map((slip) => <tr key={slip.id} className="border-t"><td className="px-3 py-3 font-semibold">{slip.ma_phieu}</td><td className="px-3 py-3">{slip.loai_phieu === "nhap" ? "Nhập kho" : "Xuất kho"}</td><td className="px-3 py-3">{(slip.chi_tiets ?? []).map((item) => `${item.san_pham?.ten_san_pham ?? "Sản phẩm"} × ${item.so_luong}`).join(", ")}</td><td className="px-3 py-3">{slip.ghi_chu ?? "—"}</td><td className="px-3 py-3">{slip.nguoi_tao?.ho_ten ?? "—"}</td><td className="px-3 py-3">{date(slip.created_at)}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">Chưa có phiếu kho.</td></tr>}</tbody>
    </table></div>}
  </section>;
}
