"use client";

// =====================================================================
// TRANG HỒ SƠ NGƯỜI DÙNG  ->  mở bằng đường link /profile
//
// Gồm 2 phần:
//   1. Thông tin cá nhân: sửa họ tên, email, số điện thoại, địa chỉ
//   2. Đổi mật khẩu: nhập mật khẩu hiện tại + mật khẩu mới
//
// Chưa đăng nhập (hoặc token hết hạn) -> tự chuyển sang /login
// =====================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, fetchMe, getToken, updateProfile } from "@/lib/auth";

const INPUT_CLASS =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 read-only:bg-slate-100 read-only:text-slate-500";

const BUTTON_CLASS =
  "rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60";

// Một ô nhập có nhãn
function Field({ label, required, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input required={required} className={INPUT_CLASS} {...inputProps} />
    </label>
  );
}

// Dòng thông báo: xanh khi thành công, đỏ khi lỗi
function Message({ message }) {
  if (!message) return null;
  const color = message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
  return (
    <p role="alert" className={`rounded-lg p-3 text-sm ${color}`}>
      {message.text}
    </p>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null); // null = đang tải
  const [loadError, setLoadError] = useState("");

  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Lúc mở trang: chưa có token thì về /login, có thì lấy thông tin mới nhất
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    fetchMe()
      .then(setUser)
      .catch((error) => {
        if (!getToken()) {
          router.replace("/login"); // token đã bị xoá vì hết hạn
        } else {
          setLoadError(error instanceof Error ? error.message : "Không tải được hồ sơ.");
        }
      });
  }, [router]);

  // Bấm "Lưu thay đổi"
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const updated = await updateProfile(data);
      setUser(updated);
      setProfileMsg({ type: "success", text: "Đã lưu thông tin." });
    } catch (error) {
      setProfileMsg({ type: "error", text: error instanceof Error ? error.message : "Lưu thất bại." });
    } finally {
      setSavingProfile(false);
    }
  };

  // Bấm "Đổi mật khẩu"
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget; // giữ lại vì sau await thì event.currentTarget không còn
    setSavingPassword(true);
    setPasswordMsg(null);

    const data = Object.fromEntries(new FormData(form));

    try {
      const message = await changePassword(data);
      form.reset();
      setPasswordMsg({ type: "success", text: message });
    } catch (error) {
      setPasswordMsg({ type: "error", text: error instanceof Error ? error.message : "Đổi mật khẩu thất bại." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadError) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-slate-500">Đang tải hồ sơ…</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý thông tin tài khoản và mật khẩu của bạn.</p>
      </div>

      {/* ---------- 1. Thông tin cá nhân ---------- */}
      <form
        onSubmit={handleProfileSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên đăng nhập" defaultValue={user.username} readOnly />
          <Field label="Họ và tên" name="ho_ten" defaultValue={user.ho_ten} required autoComplete="name" />
          <Field label="Email" name="email" type="email" defaultValue={user.email} required autoComplete="email" />
          <Field
            label="Số điện thoại"
            name="so_dien_thoai"
            type="tel"
            defaultValue={user.so_dien_thoai ?? ""}
            autoComplete="tel"
          />
        </div>
        <Field label="Địa chỉ" name="dia_chi" defaultValue={user.dia_chi ?? ""} autoComplete="street-address" />

        <Message message={profileMsg} />

        <div>
          <button type="submit" disabled={savingProfile} className={BUTTON_CLASS}>
            {savingProfile ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </form>

      {/* ---------- 2. Đổi mật khẩu ---------- */}
      <form
        onSubmit={handlePasswordSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">Đổi mật khẩu</h2>

        <Field
          label="Mật khẩu hiện tại"
          name="mat_khau_hien_tai"
          type="password"
          required
          autoComplete="current-password"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Mật khẩu mới (ít nhất 8 ký tự)"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Field
            label="Nhập lại mật khẩu mới"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <Message message={passwordMsg} />

        <div>
          <button type="submit" disabled={savingPassword} className={BUTTON_CLASS}>
            {savingPassword ? "Đang đổi…" : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </section>
  );
}
