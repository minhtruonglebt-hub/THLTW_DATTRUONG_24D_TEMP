"use client";

// =====================================================================
// TRANG THANH TOÁN  ->  /checkout
//   1. Khách điền tên, số điện thoại, địa chỉ + chọn COD hoặc QR chuyển khoản
//   2. Gửi giỏ hàng (id + số lượng) lên Laravel. GIÁ KHÔNG GỬI: server tự lấy giá từ DB.
//   3. Tạo đơn xong -> xoá giỏ -> sang /orders/{id} (nếu chọn QR sẽ hiện mã thanh toán ở đó)
// =====================================================================

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { getToken, useCurrentUser } from "@/lib/auth";
import { mediaUrl, money } from "@/lib/format";
import { clearLocalCart, getCartSessionId } from "@/utils/cartHelper";
import { useCart } from "@/utils/useCart";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500";

const METHODS = [
  { value: "momo_qr", title: "Chuyển khoản ngân hàng (quét mã QR)", note: "Mã QR có sẵn số tiền và nội dung. Quét bằng app ngân hàng hoặc MoMo." },
  { value: "cod", title: "Thanh toán khi nhận hàng (COD)", note: "Trả tiền mặt cho shipper." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { items, total } = useCart();
  const [method, setMethod] = useState("momo_qr");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionMessage, setPromotionMessage] = useState("");
  const [checkingPromotion, setCheckingPromotion] = useState(false);
  const promotionIsCurrent = appliedPromotion && Number(appliedPromotion.tam_tinh) === Number(total);

  const applyPromotion = async () => {
    setCheckingPromotion(true);
    setPromotionMessage("");
    setAppliedPromotion(null);
    try {
      const json = await callApi(`${API}/khuyen-mai/kiem-tra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_khuyen_mai: promotionCode, tam_tinh: total }),
      });
      setAppliedPromotion({ ...json.data, tam_tinh: Number(total) });
      setPromotionCode(json.data.ma_khuyen_mai);
      setPromotionMessage(`Đã áp dụng ${json.data.ma_khuyen_mai}.`);
    } catch (cause) {
      setPromotionMessage(cause instanceof Error ? cause.message : "Không áp dụng được mã.");
    } finally {
      setCheckingPromotion(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorText("");
    const form = new FormData(event.currentTarget);

    try {
      const json = await callApi(
        `${API}/don-hang`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ho_ten: form.get("ho_ten"),
            so_dien_thoai: form.get("so_dien_thoai"),
            dia_chi_giao_hang: form.get("dia_chi_giao_hang"),
            phuong_thuc_thanh_toan: method,
            ma_khuyen_mai: promotionIsCurrent ? appliedPromotion.ma_khuyen_mai : null,
            session_id: getCartSessionId(),
            items: items.map((item) => ({ san_pham_id: item.id, so_luong: item.quantity })),
          }),
        },
        getToken() ?? undefined,
      );

      const order = json.data;
      clearLocalCart();
      router.push(`/orders/${order.id}?ma=${encodeURIComponent(order.ma_don_hang)}`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Đặt hàng thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <section className="mx-auto min-h-72 max-w-3xl px-4 py-12 text-center sm:px-6">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Thanh toán</h1>
        <p className="mb-5 text-slate-600">Giỏ hàng của bạn đang trống.</p>
        <Link href="/products" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
          Tiếp tục mua sắm
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Thanh toán</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* key đổi khi đăng nhập/đăng xuất để ô nhập tự điền lại thông tin tài khoản */}
        <form key={user?.id ?? "guest"} onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Thông tin nhận hàng</h2>

          <label className="block text-sm font-medium text-slate-700">
            Họ và tên
            <input name="ho_ten" required maxLength={255} defaultValue={user?.ho_ten ?? ""} autoComplete="name" className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại
            <input name="so_dien_thoai" required maxLength={20} inputMode="tel" defaultValue={user?.so_dien_thoai ?? ""} autoComplete="tel" className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Địa chỉ giao hàng
            <textarea name="dia_chi_giao_hang" required maxLength={500} rows={3} defaultValue={user?.dia_chi ?? ""} autoComplete="street-address" className={`${inputClass} mt-1`} />
          </label>

          <fieldset className="space-y-2">
            <legend className="mb-1 font-semibold text-slate-900">Phương thức thanh toán</legend>
            {METHODS.map((m) => (
              <label key={m.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${method === m.value ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                <input type="radio" name="phuong_thuc" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="mt-1" />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{m.title}</span>
                  <span className="block text-xs text-slate-600">{m.note}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {errorText && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errorText}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting ? "Đang tạo đơn hàng…" : method === "momo_qr" ? "Đặt hàng & lấy mã QR" : "Đặt hàng"}
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Đơn hàng ({items.length} sản phẩm)</h2>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const image = mediaUrl(item.hinh_anh_url);
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {image ? (
                    <Image src={image} alt={item.ten_san_pham || "Sản phẩm"} width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded-md bg-slate-100 object-cover" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-md bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-slate-900">{item.ten_san_pham}</p>
                    <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{money(Number(item.price) * Number(item.quantity))}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <label htmlFor="promotion-code" className="text-sm font-medium text-slate-700">Mã khuyến mãi</label>
            <div className="mt-2 flex gap-2">
              <input id="promotion-code" value={promotionCode} onChange={(event) => {
                setPromotionCode(event.target.value);
                setAppliedPromotion(null);
                setPromotionMessage("");
              }} maxLength={50} className={`${inputClass} min-w-0`} placeholder="Nhập mã giảm giá" />
              <button type="button" onClick={applyPromotion} disabled={checkingPromotion || !promotionCode.trim()} className="shrink-0 rounded-lg border border-blue-600 px-3 text-sm font-semibold text-blue-700 disabled:opacity-50">
                {checkingPromotion ? "Đang kiểm tra..." : "Áp dụng"}
              </button>
            </div>
            {promotionMessage && <p role={promotionIsCurrent ? "status" : "alert"} className={`mt-2 text-xs ${promotionIsCurrent ? "text-emerald-700" : "text-red-700"}`}>{promotionMessage}</p>}
            {appliedPromotion && !promotionIsCurrent && <p className="mt-2 text-xs text-amber-700">Tổng giỏ đã thay đổi, vui lòng áp dụng lại mã.</p>}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-medium text-slate-700">Tạm tính</span>
            <span className="font-semibold text-slate-900">{money(total)}</span>
          </div>
          {promotionIsCurrent && <div className="mt-2 flex items-center justify-between text-sm text-emerald-700"><span>Giảm giá</span><span>− {money(appliedPromotion.tien_giam)}</span></div>}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-medium text-slate-700">Tổng cộng</span>
            <span className="text-lg font-bold text-slate-900">{money(promotionIsCurrent ? appliedPromotion.tong_tien : total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Giá cuối cùng do máy chủ tính lại theo giá hiện tại của sản phẩm.</p>
          <Link href="/cart" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">← Quay lại giỏ hàng</Link>
        </aside>
      </div>
    </section>
  );
}
