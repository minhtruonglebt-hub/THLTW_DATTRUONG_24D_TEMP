"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthField } from "@/components/AuthCard";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await resetPassword(data);
      router.push("/login?reset=success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đặt lại được mật khẩu.");
      setBusy(false);
    }
  }

  return <AuthCard title="Đặt lại mật khẩu" subtitle="Nhập email, mã đã nhận và mật khẩu mới.">
    <form onSubmit={submit} className="flex flex-col gap-4">
      <AuthField name="email" label="Email" type="email" required autoComplete="email" />
      <AuthField name="token" label="Mã đặt lại" required autoComplete="one-time-code" />
      <AuthField name="password" label="Mật khẩu mới (ít nhất 8 ký tự)" type="password" required minLength={8} autoComplete="new-password" />
      <AuthField name="password_confirmation" label="Nhập lại mật khẩu mới" type="password" required minLength={8} autoComplete="new-password" />
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white disabled:opacity-50">{busy ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-600"><Link href="/login" className="text-teal-700 hover:underline">Quay lại đăng nhập</Link></p>
  </AuthCard>;
}
