"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthField } from "@/components/AuthCard";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const email = new FormData(event.currentTarget).get("email");
    try {
      setMessage(await requestPasswordReset(String(email)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gửi được yêu cầu đặt lại mật khẩu.");
    } finally {
      setBusy(false);
    }
  }

  return <AuthCard title="Quên mật khẩu" subtitle="Nhập email để nhận mã đặt lại mật khẩu.">
    <form onSubmit={submit} className="flex flex-col gap-4">
      <AuthField name="email" label="Email" type="email" required autoComplete="email" />
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white disabled:opacity-50">{busy ? "Đang gửi..." : "Gửi mã đặt lại"}</button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-600">Đã có mã? <Link href="/reset-password" className="text-teal-700 hover:underline">Đặt lại mật khẩu</Link></p>
  </AuthCard>;
}
