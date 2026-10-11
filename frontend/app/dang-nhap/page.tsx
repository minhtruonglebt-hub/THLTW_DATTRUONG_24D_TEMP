"use client";

// =====================================================================
// TRANG ĐĂNG NHẬP  ->  mở bằng đường link /dang-nhap
//
// Luồng chạy:
//   1. Người dùng nhập email (hoặc username) + mật khẩu, bấm "Đăng nhập"
//   2. Gửi lên Laravel (hàm login trong lib/auth.ts)
//   3. Đúng  -> lưu token, chuyển sang trang /admin
//      Sai   -> hiện dòng báo lỗi màu đỏ
// =====================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { AuthCard, AuthField } from "../components/AuthCard";

export default function LoginPage() {
  const router = useRouter(); // dùng để chuyển trang bằng code
  const [errorText, setErrorText] = useState(""); // thông báo lỗi (nếu có)
  const [isSubmitting, setIsSubmitting] = useState(false); // đang gửi? (để khoá nút)

  // Chạy khi bấm nút "Đăng nhập"
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // chặn trình duyệt tải lại trang
    setIsSubmitting(true);
    setErrorText("");

    // Gom toàn bộ ô nhập trong form thành FormData.
    // Tên ô (name="login", name="password") trùng với tên Laravel cần nhận.
    const formData = new FormData(event.currentTarget);

    try {
      await login(formData);
      router.push("/admin"); // đăng nhập xong thì vào trang quản trị
    } catch (error) {
      setErrorText((error as Error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Đăng nhập" subtitle="Đăng nhập để vào trang quản trị cửa hàng.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField name="login" label="Email hoặc tên đăng nhập" required autoComplete="username" />
        <AuthField name="password" label="Mật khẩu" type="password" required autoComplete="current-password" />

        {/* Thông báo lỗi */}
        {errorText && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText}</p>}

        <button
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-medium text-teal-700 hover:underline">
          Đăng ký
        </Link>
      </p>
    </AuthCard>
  );
}
