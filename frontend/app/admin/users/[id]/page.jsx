"use client";

// =====================================================================
// CHI TIẾT THÀNH VIÊN (ADMIN)  ->  /admin/users/{id}
//   - Thông tin cá nhân + lịch sử đơn hàng
//   - Khoá / mở khoá tài khoản, xoá thành viên
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { ORDER_STATUS } from "@/lib/admin-config";
import { date, money } from "@/lib/format";
import Notice from "@/components/Notice";
import Badge from "@/components/Badge";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let alive = true;
    callApi(`${API}/admin/nguoi-dung/${id}`, { cache: "no-store" })
      .then((json) => {
        if (!alive) return;
        setUser(json.data);
        setOrders(json.don_hangs ?? []);
        setError("");
      })
      .catch((cause) => alive && setError(cause instanceof Error ? cause.message : "Không tải được thành viên."));
    return () => {
      alive = false;
    };
  }, [id]);

  async function toggleLock() {
    const willLock = Boolean(user.status);
    if (!confirm(willLock ? "Khoá tài khoản này?" : "Mở khoá tài khoản này?")) return;
    try {
      const json = await callApi(`${API}/admin/nguoi-dung/${id}/khoa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !willLock }),
      });
      setUser(json.data);
      setNotice({ text: json.message, ok: true });
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không cập nhật được tài khoản.", ok: false });
    }
  }

  async function remove() {
    if (!confirm("Xoá thành viên này? Hành động không thể hoàn tác.")) return;
    try {
      await callApi(`${API}/admin/nguoi-dung/${id}`, { method: "DELETE" });
      router.push("/admin/users");
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không xoá được thành viên.", ok: false });
    }
  }

  if (error) {
    return (
      <>
        <Notice text={error} />
        <Link href="/admin/users" className="text-sm text-teal-700 hover:underline">← Về danh sách thành viên</Link>
      </>
    );
  }
  if (!user) return <p className="text-sm text-slate-500">Đang tải...</p>;

  const isAdmin = user.vai_tro === "admin";

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-teal-700 hover:underline">← Về danh sách thành viên</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{user.ho_ten}</h1>
          <Badge text={user.status ? "Hoạt động" : "Bị khoá"} tone={user.status ? "ok" : "off"} />
          {isAdmin && <Badge text="Quản trị viên" tone="warn" />}
        </div>
      </div>

      <Notice text={notice?.text} ok={notice?.ok} />

      <div className="space-y-1 rounded-2xl border border-stone-200 bg-white p-5 text-sm shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-800">Thông tin cá nhân</h2>
        <p>Tên đăng nhập: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Số điện thoại: {user.so_dien_thoai ?? "—"}</p>
        <p>Địa chỉ: {user.dia_chi ?? "—"}</p>
        <p>Ngày đăng ký: {date(user.created_at)}</p>
        {!isAdmin && (
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={toggleLock}
              className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              {user.status ? "Khoá tài khoản" : "Mở khoá tài khoản"}
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              Xoá thành viên
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 font-semibold text-slate-800">Lịch sử đơn hàng ({orders.length})</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="bg-stone-100/80 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Ngày đặt</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-teal-700 hover:underline">{o.ma_don_hang}</Link>
                </td>
                <td className="px-4 py-3">{date(o.created_at)}</td>
                <td className="px-4 py-3">{ORDER_STATUS[o.trang_thai] ?? o.trang_thai}</td>
                <td className="px-4 py-3 text-right">{money(o.tong_tien)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Chưa có đơn hàng</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
