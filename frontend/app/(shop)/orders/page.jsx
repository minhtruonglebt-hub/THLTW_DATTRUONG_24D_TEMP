"use client";

// =====================================================================
// LỊCH SỬ ĐƠN HÀNG  ->  /orders          (chỉ thành viên đã đăng nhập)
//   Danh sách đơn đã đặt: mã đơn, ngày đặt, trạng thái, tổng tiền (có phân trang)
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { API, callApi } from "@/lib/api";
import { getToken, useCurrentUser } from "@/lib/auth";
import { date, money } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/admin-config";
import Pagination from "@/components/common/Pagination";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const user = useCurrentUser();
  const [orders, setOrders] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const needsLogin = Boolean(user && !getToken());
  const displayError = needsLogin ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại." : error;

  useEffect(() => {
    if (!user || !getToken()) return;

    let alive = true;
    callApi(`${API}/don-hang?per_page=${PAGE_SIZE}&page=${page}`, { cache: "no-store" })
      .then((json) => {
        if (!alive) return;
        setOrders(json.data ?? []);
        setPageCount(json.meta?.last_page ?? 1);
      })
      .catch((cause) => alive && setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng."));
    return () => {
      alive = false;
    };
  }, [user, page, retryCount]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <p className="mt-3 text-slate-600">Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
        <Link href="/login" className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Đăng nhập
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Đơn hàng của tôi</h1>

      {displayError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <p>{displayError}</p>
          {needsLogin ? (
            <Link href="/login" className="font-semibold underline underline-offset-2">Đăng nhập lại</Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOrders(null);
                setError("");
                setRetryCount((count) => count + 1);
              }}
              className="font-semibold underline underline-offset-2"
            >
              Thử lại
            </button>
          )}
        </div>
      )}
      {!orders && !displayError && <p className="text-slate-500">Đang tải đơn hàng...</p>}

      {orders && orders.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          Bạn chưa có đơn hàng nào.{" "}
          <Link href="/products" className="text-blue-600 hover:underline">Mua sắm ngay</Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Mã đơn</th>
                <th className="px-4 py-3 font-medium">Ngày đặt</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{o.ma_don_hang}</td>
                  <td className="px-4 py-3">{date(o.created_at)}</td>
                  <td className="px-4 py-3">{ORDER_STATUS[o.trang_thai] ?? o.trang_thai}</td>
                  <td className="px-4 py-3 text-right">{money(o.tong_tien)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/orders/${o.id}`} className="text-blue-600 hover:underline">Xem chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            pageCount={pageCount}
            onPageChange={(nextPage) => {
              setOrders(null);
              setError("");
              setPage(nextPage);
            }}
          />
        </div>
      )}
    </section>
  );
}
