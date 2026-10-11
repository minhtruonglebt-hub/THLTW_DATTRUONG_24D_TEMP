"use client";

// =====================================================================
// TRANG ĐĂNG KÝ  ->  mở bằng đường link /dang-ky
//
// Luồng chạy:
//   1. Người dùng điền thông tin, bấm "Đăng ký"
//   2. Gửi lên Laravel (hàm register trong lib/auth.ts)
//   3. Thành công -> Laravel tạo tài khoản và tự đăng nhập luôn,
//                    chuyển sang trang /admin
//      Thất bại   -> hiện lỗi (vd: email đã tồn tại, mật khẩu dưới 8 ký tự)
//
// Các ô và quy tắc khớp với DangKyRequest.php bên Laravel:
//   username, ho_ten, email, password (≥ 8 ký tự, phải nhập lại),
//   so_dien_thoai và dia_chi là không bắt buộc.
// =====================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { AuthCard, AuthField } from "../components/AuthCard";

export default function RegisterPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");

    const formData = new FormData(event.currentTarget);

    // Kiểm tra trước ở trình duyệt cho nhanh, đỡ phải gửi lên Laravel
    if (formData.get("password") !== formData.get("password_confirmation")) {
      setErrorText("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      router.push("/admin");
    } catch (error) {
      setErrorText((error as Error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Đăng ký" subtitle="Tạo tài khoản mới. Các ô có dấu * là bắt buộc." wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hai ô trên một hàng (màn hình nhỏ thì xếp dọc) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField name="ho_ten" label="Họ tên" required autoComplete="name" />
          <AuthField name="username" label="Tên đăng nhập" required autoComplete="username" />
          <AuthField name="email" label="Email" type="email" required autoComplete="email" />
          <AuthField name="so_dien_thoai" label="Số điện thoại" autoComplete="tel" />
          <AuthField name="password" label="Mật khẩu (tối thiểu 8 ký tự)" type="password" required minLength={8} autoComplete="new-password" />
          <AuthField name="password_confirmation" label="Nhập lại mật khẩu" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <AuthField name="dia_chi" label="Địa chỉ" autoComplete="street-address" />

        {errorText && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText}</p>}

        <button
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang tạo tài khoản…" : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-medium text-teal-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthCard>
  );
}
