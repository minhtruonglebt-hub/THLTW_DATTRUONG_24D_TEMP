"use client";

// =====================================================================
// TRANG ĐĂNG NHẬP ADMIN  ->  mở bằng đường link /admin/login
//
// Luồng chạy:
//   1. Nhập email (hoặc username) + mật khẩu, bấm "Đăng nhập"
//   2. Gửi lên Laravel (hàm login trong lib/auth.ts)
//   3. Đúng  -> lưu token, chuyển sang trang /admin
//      Sai   -> hiện dòng báo lỗi màu đỏ
// =====================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { AuthCard, AuthField } from "@/components/AuthCard";

export default function LoginAdmin() {
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
      await login(formData);
      router.push("/admin");
    } catch (error) {
      setErrorText(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Đăng nhập Admin" subtitle="Đăng nhập để vào trang quản trị cửa hàng.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField name="login" label="Email hoặc tên đăng nhập" required autoComplete="username" />
        <AuthField name="password" label="Mật khẩu" type="password" required autoComplete="current-password" />

        {errorText && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText}</p>}

        <button
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </AuthCard>
  );
}
