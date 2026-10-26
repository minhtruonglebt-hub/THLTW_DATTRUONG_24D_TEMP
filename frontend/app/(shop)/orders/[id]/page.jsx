"use client";

// =====================================================================
// TRANG CHI TIẾT ĐƠN HÀNG  ->  /orders/{id}?ma=DHxxxx
//   - Hiện thông tin đơn + trạng thái
//   - Đơn MoMo chưa trả tiền: hiện mã QR và tự hỏi Laravel (Laravel hỏi MoMo) mỗi 4 giây
//   - MoMo cũng chuyển khách về đúng trang này sau khi thanh toán (redirectUrl)
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MomoPayment from "@/components/shop/MomoPayment";
import { API, callApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { date, money } from "@/lib/format";

const ORDER_STATUS = {
  cho_xac_nhan: "Chờ xác nhận",
  da_xac_nhan: "Đã xác nhận",
  dang_giao: "Đang giao",
  hoan_tat: "Hoàn tất",
  da_huy: "Đã huỷ",
};

const PAYMENT_STATUS = {
  chua_thanh_toan: "Chưa thanh toán (COD)",
  cho_thanh_toan: "Chờ thanh toán",
  cho_shop_xac_nhan: "Đã báo chuyển khoản, chờ shop xác nhận",
  da_thanh_toan: "Đã thanh toán",
  that_bai: "Thanh toán chưa thành công",
};

// Khách vãng lai xem đơn bằng mã đơn trên URL (?ma=...). Đọc lúc chạy sự kiện, không đọc khi render.
const maQuery = () => `ma_don_hang=${encodeURIComponent(new URLSearchParams(window.location.search).get("ma") || "")}`;
const authToken = () => getToken() ?? undefined;

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Tải đơn hàng
  useEffect(() => {
    let alive = true;
    callApi(`${API}/don-hang/${id}?${maQuery()}`, { cache: "no-store" }, authToken())
      .then((json) => alive && setOrder(json.data))
      .catch((cause) => alive && setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  // Tự cập nhật trạng thái khi đang chờ tiền (dừng khi đã trả / thất bại / huỷ):
  //   - MoMo cổng: hỏi Laravel -> Laravel hỏi MoMo
  //   - QR cá nhân: chỉ tải lại đơn, chờ shop bấm xác nhận
  let pollPath = null;
  if (order && order.trang_thai !== "da_huy") {
    const st = order.trang_thai_thanh_toan;
    if (order.phuong_thuc_thanh_toan === "momo" && st === "cho_thanh_toan" && order.thanh_toan?.pay_url) pollPath = "/momo/trang-thai";
    if (order.phuong_thuc_thanh_toan === "momo_qr" && (st === "cho_thanh_toan" || st === "cho_shop_xac_nhan")) pollPath = "";
  }

  useEffect(() => {
    if (pollPath === null) return;
    let alive = true;

    const check = async () => {
      try {
        const json = await callApi(`${API}/don-hang/${id}${pollPath}?${maQuery()}`, { cache: "no-store" }, authToken());
        if (alive) setOrder(json.data);
      } catch {
        // mất mạng thoáng qua: lần hỏi sau sẽ thử lại
      }
    };

    const timer = setInterval(check, 5000);
    if (pollPath) check();
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [pollPath, id]);

  const post = async (path) => {
    setBusy(true);
    setMessage("");
    try {
      const json = await callApi(
        `${API}/don-hang/${id}/${path}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ma_don_hang: new URLSearchParams(window.location.search).get("ma") || "" }),
        },
        authToken(),
      );
      setOrder(json.data);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Bạn chắc chắn muốn huỷ đơn hàng này?")) post("huy");
  };

  if (loading) return <p className="mx-auto max-w-5xl px-6 py-20 text-center text-slate-500">Đang tải đơn hàng...</p>;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="text-red-700">{error || "Không tìm thấy đơn hàng."}</p>
        <Link href="/products" className="mt-5 inline-block font-semibold text-blue-600 hover:underline">
          Về trang sản phẩm
        </Link>
      </div>
    );
  }

  const isMomo = order.phuong_thuc_thanh_toan === "momo" || order.phuong_thuc_thanh_toan === "momo_qr";
  const canCancel = order.trang_thai === "cho_xac_nhan" && !["da_thanh_toan", "cho_shop_xac_nhan"].includes(order.trang_thai_thanh_toan);

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Đơn hàng {order.ma_don_hang}</h1>
          <p className="mt-1 text-sm text-slate-500">Đặt lúc {date(order.created_at)}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          {ORDER_STATUS[order.trang_thai] ?? order.trang_thai}
        </span>
      </div>

      {isMomo && <MomoPayment order={order} busy={busy} message={message} onRetry={() => post("momo")} onPaid={() => post("da-chuyen-khoan")} />}
      {!isMomo && message && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <h2 className="mb-2 font-semibold text-slate-900">Thông tin nhận hàng</h2>
          <p>{order.ho_ten}</p>
          <p>{order.so_dien_thoai}</p>
          <p>{order.dia_chi_giao_hang}</p>
        </div>
        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <h2 className="mb-2 font-semibold text-slate-900">Thanh toán</h2>
          <p>Phương thức: {isMomo ? "MoMo" : "Thanh toán khi nhận hàng (COD)"}</p>
          <p>Trạng thái: {PAYMENT_STATUS[order.trang_thai_thanh_toan] ?? order.trang_thai_thanh_toan}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {(order.chi_tiets ?? []).map((ct) => (
            <li key={ct.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{ct.ten_san_pham}</p>
                <p className="text-slate-500">{money(ct.don_gia)} × {ct.so_luong}</p>
              </div>
              <p className="font-semibold text-slate-800">{money(ct.thanh_tien)}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <span className="font-medium text-slate-700">Tổng cộng</span>
          <span className="text-lg font-bold text-slate-900">{money(order.tong_tien)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link href="/products" className="text-sm font-medium text-blue-700 hover:underline">← Tiếp tục mua sắm</Link>
        {canCancel && (
          <button type="button" onClick={handleCancel} disabled={busy} className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60">
            Huỷ đơn hàng
          </button>
        )}
      </div>
    </section>
  );
}
