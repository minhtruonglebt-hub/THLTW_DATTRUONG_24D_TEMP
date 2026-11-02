"use client";

// =====================================================================
// CHI TIẾT ĐƠN HÀNG (ADMIN)  ->  /admin/orders/{id}
//   - Xem sản phẩm, thông tin khách, địa chỉ giao, thanh toán
//   - Đổi trạng thái: Chờ xác nhận -> Đã xác nhận -> Đang giao -> Hoàn tất (hoặc Huỷ)
//   - Xem lịch sử các lần đổi trạng thái
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { ORDER_STATUS } from "@/lib/admin-config";
import { date, money } from "@/lib/format";
import { inputClass } from "@/components/Form";
import Notice from "@/components/Notice";
import Badge from "@/components/Badge";

// Đơn đang ở trạng thái nào thì được chuyển sang những trạng thái nào (khớp với Laravel)
const NEXT_STATUS = {
  cho_xac_nhan: ["da_xac_nhan", "da_huy"],
  da_xac_nhan: ["dang_giao", "da_huy"],
  dang_giao: ["hoan_tat", "da_huy"],
  hoan_tat: [],
  da_huy: [],
};

const PAYMENT_METHOD = { cod: "COD (thanh toán khi nhận hàng)", momo: "MoMo", momo_qr: "QR ngân hàng" };

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    let alive = true;
    callApi(`${API}/admin/don-hang/${id}`, { cache: "no-store" })
      .then((json) => {
        if (!alive) return;
        setOrder(json.data);
        setError("");
      })
      .catch((cause) => alive && setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng."));
    return () => {
      alive = false;
    };
  }, [id, version]);

  async function submitStatus(event) {
    event.preventDefault();
    if (!newStatus) return;
    if (newStatus === "da_huy" && !confirm("Huỷ đơn này? Hàng sẽ được trả về kho.")) return;

    setBusy(true);
    setNotice(null);
    try {
      const json = await callApi(`${API}/admin/don-hang/${id}/trang-thai`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: newStatus, ghi_chu: note || null }),
      });
      setOrder(json.data);
      setNewStatus("");
      setNote("");
      setNotice({ text: "Đã cập nhật trạng thái đơn hàng", ok: true });
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không cập nhật được trạng thái.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment() {
    if (!confirm(`Bạn đã thấy tiền của đơn ${order.ma_don_hang}?`)) return;
    try {
      await callApi(`${API}/don-hang/${id}/xac-nhan-thanh-toan`, { method: "POST" });
      reload();
      setNotice({ text: "Đã xác nhận thanh toán", ok: true });
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không xác nhận được thanh toán.", ok: false });
    }
  }

  if (error) {
    return (
      <>
        <Notice text={error} />
        <Link href="/admin/orders" className="text-sm text-teal-700 hover:underline">← Về danh sách đơn hàng</Link>
      </>
    );
  }
  if (!order) return <p className="text-sm text-slate-500">Đang tải đơn hàng...</p>;

  const options = NEXT_STATUS[order.trang_thai] ?? [];
  const paid = order.trang_thai_thanh_toan === "da_thanh_toan";

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-teal-700 hover:underline">← Về danh sách đơn hàng</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Đơn {order.ma_don_hang}</h1>
          <Badge
            text={ORDER_STATUS[order.trang_thai] ?? order.trang_thai}
            tone={order.trang_thai === "da_huy" ? "off" : order.trang_thai === "cho_xac_nhan" ? "warn" : "ok"}
          />
        </div>
        <p className="mt-1 text-sm text-slate-500">Đặt lúc {date(order.created_at)}</p>
      </div>

      <Notice text={notice?.text} ok={notice?.ok} />

      {/* Thông tin khách + thanh toán */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-stone-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-800">Thông tin giao hàng</h2>
          <p>Người nhận: <b>{order.ho_ten}</b></p>
          <p>Số điện thoại: {order.so_dien_thoai}</p>
          <p>Địa chỉ: {order.dia_chi_giao_hang}</p>
          <p>
            Tài khoản:{" "}
            {order.nguoi_dung ? (
              <Link href={`/admin/users/${order.nguoi_dung.id}`} className="text-teal-700 hover:underline">
                {order.nguoi_dung.ho_ten} ({order.nguoi_dung.email})
              </Link>
            ) : (
              "Khách vãng lai"
            )}
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-stone-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-800">Thanh toán</h2>
          <p>Phương thức: {PAYMENT_METHOD[order.phuong_thuc_thanh_toan] ?? order.phuong_thuc_thanh_toan ?? "—"}</p>
          <p>Tình trạng: {paid ? <span className="font-semibold text-emerald-700">Đã thanh toán {order.paid_at ? `(${date(order.paid_at)})` : ""}</span> : "Chưa thanh toán"}</p>
          {order.ma_khuyen_mai && <p>Mã giảm giá: {order.ma_khuyen_mai} (− {money(order.tien_giam)})</p>}
          <p>Tổng tiền: <b>{money(order.tong_tien)}</b></p>
          {order.phuong_thuc_thanh_toan === "momo_qr" && !paid && order.trang_thai !== "da_huy" && (
            <button
              type="button"
              onClick={confirmPayment}
              className="mt-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Đã nhận tiền
            </button>
          )}
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100/80 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 text-right font-medium">Đơn giá</th>
              <th className="px-4 py-3 text-right font-medium">Số lượng</th>
              <th className="px-4 py-3 text-right font-medium">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.chi_tiets ?? []).map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{item.ten_san_pham ?? item.san_pham?.ten_san_pham}</td>
                <td className="px-4 py-3 text-right">{money(item.don_gia)}</td>
                <td className="px-4 py-3 text-right">{item.so_luong}</td>
                <td className="px-4 py-3 text-right">{money(item.thanh_tien)}</td>
              </tr>
            ))}
            <tr className="border-t border-stone-200 bg-stone-50 font-semibold">
              <td className="px-4 py-3 text-right" colSpan={3}>Tổng cộng</td>
              <td className="px-4 py-3 text-right">{money(order.tong_tien)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Đổi trạng thái */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Cập nhật trạng thái</h2>
        {options.length === 0 ? (
          <p className="text-sm text-slate-500">Đơn đã ở trạng thái cuối, không thể thay đổi nữa.</p>
        ) : (
          <form onSubmit={submitStatus} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Trạng thái mới</span>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={`${inputClass} sm:w-56`} required>
                <option value="">— Chọn —</option>
                {options.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS[s]}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Ghi chú (không bắt buộc)</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={inputClass} />
            </label>
            <button
              disabled={busy || !newStatus}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {busy ? "Đang lưu…" : "Cập nhật"}
            </button>
          </form>
        )}
      </div>

      {/* Lịch sử trạng thái */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Lịch sử trạng thái</h2>
        {(order.lich_su ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có lịch sử (đơn tạo trước khi bật tính năng này).</p>
        ) : (
          <ol className="space-y-3 border-l-2 border-teal-200 pl-4 text-sm">
            {order.lich_su.map((h) => (
              <li key={h.id}>
                <p className="font-medium text-slate-800">
                  {h.trang_thai_cu ? `${ORDER_STATUS[h.trang_thai_cu] ?? h.trang_thai_cu} → ` : ""}
                  {ORDER_STATUS[h.trang_thai_moi] ?? h.trang_thai_moi}
                </p>
                <p className="text-xs text-slate-500">
                  {date(h.created_at)}
                  {h.nguoi_thuc_hien ? ` · ${h.nguoi_thuc_hien}` : ""}
                </p>
                {h.ghi_chu && <p className="text-slate-600">{h.ghi_chu}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
