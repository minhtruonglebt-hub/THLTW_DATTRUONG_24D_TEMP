"use client";

// =====================================================================
// CHI TIẾT + PHẢN HỒI LIÊN HỆ (ADMIN)  ->  /admin/contacts/{id}
//   Xem nội dung khách gửi, ghi lại phản hồi và đánh dấu đã xử lý
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { date } from "@/lib/format";
import { inputClass } from "@/components/Form";
import Notice from "@/components/Notice";

export default function AdminContactDetailPage() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [reply, setReply] = useState("");
  const [handled, setHandled] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    callApi(`${API}/admin/lien-he/${id}`, { cache: "no-store" })
      .then((json) => {
        if (!alive) return;
        setContact(json.data);
        setReply(json.data.phan_hoi ?? "");
        setHandled(json.data.trang_thai === "da_xu_ly");
      })
      .catch((cause) => alive && setError(cause instanceof Error ? cause.message : "Không tải được liên hệ."));
    return () => {
      alive = false;
    };
  }, [id]);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const json = await callApi(`${API}/admin/lien-he/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: handled ? "da_xu_ly" : "chua_xu_ly", phan_hoi: reply || null }),
      });
      setContact(json.data);
      setNotice({ text: "Đã lưu phản hồi", ok: true });
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không lưu được.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <>
        <Notice text={error} />
        <Link href="/admin/contacts" className="text-sm text-teal-700 hover:underline">← Về danh sách liên hệ</Link>
      </>
    );
  }
  if (!contact) return <p className="text-sm text-slate-500">Đang tải...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/contacts" className="text-sm text-teal-700 hover:underline">← Về danh sách liên hệ</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{contact.tieu_de || "Liên hệ (không có tiêu đề)"}</h1>
        <p className="mt-1 text-sm text-slate-500">Gửi lúc {date(contact.created_at)}</p>
      </div>

      <Notice text={notice?.text} ok={notice?.ok} />

      <div className="space-y-1 rounded-2xl border border-stone-200 bg-white p-5 text-sm shadow-sm">
        <p>Họ tên: <b>{contact.ho_ten}</b></p>
        <p>Email: {contact.email}</p>
        <p>Số điện thoại: {contact.so_dien_thoai ?? "—"}</p>
        <p className="whitespace-pre-wrap pt-2 text-slate-700">{contact.noi_dung}</p>
      </div>

      {contact.trang_thai === "chua_xu_ly" && contact.phan_hoi && (
        <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Khách đã nhận phản hồi tự động; cần quản trị viên kiểm tra và tiếp tục xử lý liên hệ này.
        </p>
      )}

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">Nội dung phản hồi / ghi chú xử lý</span>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={5} maxLength={2000} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={handled} onChange={(e) => setHandled(e.target.checked)} />
          Đánh dấu đã xử lý
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Đang lưu…" : "Lưu"}
        </button>
      </form>
    </div>
  );
}
