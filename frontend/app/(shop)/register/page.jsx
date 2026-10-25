"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthField } from "@/components/AuthCard";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorText("");

    const formData = new FormData(event.currentTarget);

    try {
      await register(formData);
      router.push("/");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Tạo tài khoản" subtitle="Đăng ký để mua sắm và theo dõi đơn hàng của bạn." wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField name="ho_ten" label="Họ và tên" required autoComplete="name" />
          <AuthField name="username" label="Tên đăng nhập" required autoComplete="username" />
          <AuthField name="email" label="Email" type="email" required autoComplete="email" />
          <AuthField name="so_dien_thoai" label="Số điện thoại" type="tel" autoComplete="tel" />
          <AuthField name="password" label="Mật khẩu (ít nhất 8 ký tự)" type="password" required minLength={8} autoComplete="new-password" />
          <AuthField
            name="password_confirmation"
            label="Nhập lại mật khẩu"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <AuthField name="dia_chi" label="Địa chỉ" autoComplete="street-address" />

        {errorText && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorText}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isSubmitting ? "Đang tạo tài khoản…" : "Đăng ký"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
          Đăng nhập
        </Link>
      </p>
    </AuthCard>
  );
}
