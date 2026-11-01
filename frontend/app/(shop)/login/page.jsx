"use client";

// =====================================================================
// TRANG ĐĂNG NHẬP CỦA SHOP  ->  mở bằng đường link /login
//
// Luồng chạy:
//   1. Nhập email (hoặc username) + mật khẩu, bấm "Đăng nhập"
//   2. Gửi lên Laravel (hàm login trong lib/auth.ts)
//   3. Đúng  -> lưu token; admin chuyển sang /admin, khách về trang chủ
//      Sai   -> hiện dòng báo lỗi màu đỏ
// =====================================================================

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthField } from "@/components/AuthCard";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorText("");

    // Tên ô (login, password) trùng với tên Laravel cần nhận
    const formData = new FormData(event.currentTarget);

    try {
      const user = await login(formData);
      router.push(user.vai_tro === "admin" ? "/admin" : "/");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Đăng nhập" subtitle="Đăng nhập để mua sắm và theo dõi đơn hàng của bạn.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField name="login" label="Email hoặc tên đăng nhập" required autoComplete="username" />
        <AuthField name="password" label="Mật khẩu" type="password" required autoComplete="current-password" />

        {errorText && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-teal-700 hover:text-teal-800">
          Đăng ký
        </Link>
      </p>
    </AuthCard>
  );
}
