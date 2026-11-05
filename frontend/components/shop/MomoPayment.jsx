"use client";

// Hiển thị mã QR chuyển khoản hoặc thanh toán MoMo trên trang đơn hàng.

import { QRCodeSVG } from "qrcode.react";
import { date, money } from "@/lib/format";

export default function MomoPayment({ order, busy, onRetry, onPaid, message }) {
  const paid = order.trang_thai_thanh_toan === "da_thanh_toan";
  const failed = order.trang_thai_thanh_toan === "that_bai";
  const pay = order.thanh_toan; // { pay_url, qr_code } hoặc null

  if (paid) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-800">
        <p className="font-semibold">✔ Đã thanh toán {money(order.tong_tien)}</p>
        {order.paid_at && <p className="mt-1 text-sm">Lúc {date(order.paid_at)}</p>}
      </div>
    );
  }

  if (order.trang_thai === "da_huy") return null;

  // ---- QR chuyển khoản: khách quét, shop đối chiếu tiền rồi xác nhận ----
  if (order.phuong_thuc_thanh_toan === "momo_qr") {
    const qr = order.thanh_toan;
    const reported = order.trang_thai_thanh_toan === "cho_shop_xac_nhan";

    return (
      <div className="rounded-xl border border-pink-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Chuyển khoản qua QR ngân hàng</h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {qr?.qr_content ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <QRCodeSVG value={qr.qr_content} size={208} marginSize={1} />
            </div>
          ) : (
            <p className="max-w-64 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Shop chưa cấu hình mã QR nhận tiền. Vui lòng chọn COD hoặc liên hệ shop để được hỗ trợ thanh toán.
            </p>
          )}
          <div className="space-y-2 text-sm text-slate-700">
            <p>Số tiền: <b className="text-base text-slate-900">{money(qr?.so_tien ?? order.tong_tien)}</b></p>
            {qr?.ten && <p>Người nhận: <b>{qr.ten}</b></p>}
            <p>Nội dung: <b>{order.ma_don_hang}</b></p>
            <p className="text-xs text-slate-500">Quét bằng app ngân hàng hoặc MoMo. Số tiền và nội dung đã điền sẵn, vui lòng không sửa.</p>

            {reported ? (
              <p className="rounded-lg bg-blue-50 p-3 text-blue-800" aria-live="polite">
                ⏳ Đã ghi nhận. Shop sẽ đối chiếu và xác nhận trong ít phút, trang này tự cập nhật.
              </p>
            ) : (
              <button type="button" onClick={onPaid} disabled={busy} className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700 disabled:opacity-60">
                {busy ? "Đang gửi…" : "Tôi đã chuyển khoản"}
              </button>
            )}
          </div>
        </div>
        {message && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-pink-200 bg-white p-5">
      <h2 className="mb-1 font-semibold text-slate-900">Thanh toán bằng MoMo</h2>

      {failed && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Giao dịch chưa thành công hoặc mã đã hết hạn. Bấm “Tạo lại mã” để thử lại.
        </p>
      )}

      {pay?.pay_url ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <QRCodeSVG value={pay.qr_code || pay.pay_url} size={208} marginSize={1} />
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Số tiền: <b className="text-base text-slate-900">{money(order.tong_tien)}</b>
            </p>
            <p>
              Mã đơn: <b>{order.ma_don_hang}</b>
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-slate-600">
              <li>Mở app MoMo, chọn <b>Quét mã</b>.</li>
              <li>Quét mã QR bên cạnh và xác nhận thanh toán.</li>
              <li>Trang này tự cập nhật khi MoMo báo đã nhận tiền.</li>
            </ol>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={pay.pay_url} target="_blank" rel="noreferrer" className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700">
                Mở trang thanh toán MoMo
              </a>
              <button type="button" onClick={onRetry} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {busy ? "Đang tạo…" : "Tạo lại mã"}
              </button>
            </div>
            {!failed && <p className="text-xs text-slate-500" aria-live="polite">⏳ Đang chờ thanh toán…</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-slate-600">
          <p>Đơn hàng chưa có mã thanh toán MoMo.</p>
          <button type="button" onClick={onRetry} disabled={busy} className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700 disabled:opacity-60">
            {busy ? "Đang tạo…" : "Tạo mã thanh toán MoMo"}
          </button>
        </div>
      )}

      {message && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
    </div>
  );
}
