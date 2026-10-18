"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { mediaUrl, money } from "@/lib/format";
import { clearCart, removeFromCart, updateCartQuantity } from "@/utils/cartHelper";

function subscribeToCart(onChange) {
  window.addEventListener("cartUpdated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("cartUpdated", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getCartSnapshot() {
  return window.localStorage.getItem("cart") || "[]";
}

function getServerCartSnapshot() {
  return "[]";
}

export default function CartPage() {
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(snapshot);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [snapshot]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items],
  );

  return (
    <section className="mx-auto min-h-72 max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Giỏ hàng</h1>
        {items.length > 0 && (
          <button type="button" onClick={clearCart} className="text-sm font-medium text-red-600 hover:underline">
            Xóa toàn bộ
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
          <p className="mb-5 text-slate-600">Giỏ hàng của bạn đang trống.</p>
          <Link href="/products" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {items.map((item) => {
              const image = mediaUrl(item.hinh_anh_url);
              return (
                <li key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <Link href={item.slug ? `/products/${item.slug}` : "/products"} className="flex min-w-0 flex-1 items-center gap-4">
                    {image ? (
                      <Image src={image} alt={item.ten_san_pham || "Sản phẩm"} width={80} height={80} unoptimized className="h-20 w-20 shrink-0 rounded-lg bg-slate-100 object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-center text-xs text-slate-500">Chưa có ảnh</div>
                    )}
                    <span className="line-clamp-2 font-semibold text-slate-900 hover:text-blue-600">{item.ten_san_pham || "Sản phẩm"}</span>
                  </Link>

                  <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                    <p className="min-w-24 font-semibold text-slate-800">{money(item.price)}</p>
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button type="button" aria-label={`Giảm số lượng ${item.ten_san_pham}`} onClick={() => updateCartQuantity(item.id, Number(item.quantity) - 1)} disabled={Number(item.quantity) <= 1} className="px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">−</button>
                      <span className="min-w-9 text-center" aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={`Tăng số lượng ${item.ten_san_pham}`} onClick={() => updateCartQuantity(item.id, Number(item.quantity) + 1)} className="px-3 py-2">+</button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-medium text-red-600 hover:underline">Xóa</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col items-stretch justify-between gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center">
            <Link href="/products" className="text-sm font-medium text-blue-700 hover:underline">← Tiếp tục mua sắm</Link>
            <p className="text-lg font-bold text-slate-900">Tạm tính: {money(total)}</p>
          </div>
        </>
      )}
    </section>
  );
}
