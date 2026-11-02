"use client";

// =====================================================================
// TRANG LIÊN HỆ  ->  /contact
//
// Luồng chạy:
//   1. Khách điền họ tên, email, (số điện thoại, tiêu đề), nội dung
//   2. Bấm "Gửi liên hệ" -> gửi POST lên Laravel: /api/lien-he
//   3. Thành công -> hiện phản hồi tự động (nếu có) và xoá form
//      Thất bại   -> hiện dòng báo lỗi đỏ (lỗi nhập liệu do Laravel trả về)
// Không cần đăng nhập. Admin xem các liên hệ ở /admin/contacts.
// =====================================================================

import { useState } from "react";
import { API, callApi } from "@/lib/api";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const MAX_CONTENT = 2000; // trùng với luật validate ở Laravel

function Field({ name, label, type = "text", required, maxLength, placeholder, autoComplete }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={INPUT_CLASS}
      />
    </label>
  );
}

export default function ContactPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [needsHuman, setNeedsHuman] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setSuccessText("");
    setErrorText("");
    setAiReply("");
    setEmailNotice("");
    setNeedsHuman(false);
    setDemoMode(false);

    // Tên ô trùng với tên cột Laravel cần nhận (ho_ten, email, ...)
    const data = Object.fromEntries(new FormData(form));
    // Ô không bắt buộc để trống thì không gửi (Laravel coi là null)
    for (const key of ["so_dien_thoai", "tieu_de"]) {
      if (!String(data[key] ?? "").trim()) delete data[key];
    }

    try {
      const json = await callApi(`${API}/lien-he`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSuccessText(json.message ?? "Cảm ơn bạn! Chúng tôi đã nhận được liên hệ.");
      setAiReply(json.ai_reply ?? "");
      setNeedsHuman(Boolean(json.needs_human));
      setDemoMode(json.reply_mode === "demo");
      if (json.ai_reply) {
        if (json.email_delivery === "logged") {
          setEmailNotice("Email thử đã ghi vào backend/logs/laravel.log, chưa gửi tới hộp thư thật.");
        } else if (json.email_delivery === "sent") {
          setEmailNotice("Máy chủ email đã nhận bản sao phản hồi để gửi tới bạn.");
        } else if (json.email_delivery === "failed") {
          setEmailNotice("Gửi email thất bại; phản hồi vẫn hiển thị tại đây.");
        } else {
          setEmailNotice("Chưa cấu hình email gửi đi.");
        }
        if (json.needs_human) {
          setEmailNotice((notice) => `${notice} Quản trị viên sẽ tiếp tục xử lý liên hệ.`);
        }
      } else {
        setEmailNotice("Quản trị viên sẽ kiểm tra nội dung và phản hồi qua email.");
      }
      form.reset();
      setContent("");
    } catch (cause) {
      setErrorText(cause instanceof Error ? cause.message : "Gửi liên hệ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Liên hệ</h1>
      <p className="mt-2 text-sm text-slate-600">
        AI có thể hỗ trợ câu hỏi chung về sản phẩm. Câu hỏi về đơn hàng, thanh toán hoặc thông tin chưa rõ sẽ được chuyển cho quản trị viên.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Nội dung bạn nhập có thể được gửi tới nhà cung cấp AI để soạn phản hồi. Không gửi mật khẩu, mã OTP hoặc thông tin thẻ.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Thông tin cửa hàng */}
        <aside className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">✉️ Email</p>
            <p className="mt-1 text-sm text-slate-700">cuahang@example.com</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">📞 Hotline</p>
            <p className="mt-1 text-sm text-slate-700">0123 456 789</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">🕒 Giờ làm việc</p>
            <p className="mt-1 text-sm text-slate-700">Thứ 2 – Thứ 7: 8:00 – 21:00</p>
          </div>
        </aside>

        {/* Form gửi liên hệ */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="ho_ten" label="Họ và tên" required maxLength={255} autoComplete="name" />
              <Field name="email" label="Email" type="email" required maxLength={255} autoComplete="email" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="so_dien_thoai" label="Số điện thoại" type="tel" maxLength={20} autoComplete="tel" />
              <Field name="tieu_de" label="Tiêu đề" maxLength={255} />
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">
                Nội dung<span className="text-red-500"> *</span>
              </span>
              <textarea
                name="noi_dung"
                required
                minLength={10}
                maxLength={MAX_CONTENT}
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Nhập nội dung bạn muốn gửi (ít nhất 10 ký tự)..."
                className={INPUT_CLASS}
              />
              <span className="self-end text-xs text-slate-500">
                {content.length}/{MAX_CONTENT}
              </span>
            </label>

            {successText && (
              <div role="status" className="space-y-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <p>{successText}</p>
                {demoMode && <p className="font-semibold text-blue-800">Đang dùng AI DEMO: đây là phản hồi mô phỏng, không gọi AI thật.</p>}
                {aiReply && <p className="whitespace-pre-wrap border-t border-green-200 pt-2">{aiReply}</p>}
                {needsHuman && aiReply && <p className="text-xs text-amber-800">Liên hệ này đang chờ quản trị viên tiếp tục xử lý.</p>}
                {emailNotice && <p className="text-xs text-green-700">{emailNotice}</p>}
              </div>
            )}
            {errorText && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Đang gửi…" : "Gửi liên hệ"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
