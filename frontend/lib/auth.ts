// =====================================================================
// FILE NÀY LÀ GÌ?
// Mọi thứ liên quan đến tài khoản:
//   - login()    : đăng nhập
//   - register() : đăng ký
//   - logout()   : đăng xuất
//   - useCurrentUser() : cho biết ai đang đăng nhập (dùng trong Sidebar)
//   - fetchMe(), updateProfile(), changePassword() : trang hồ sơ (/profile)
//
// CÁCH HOẠT ĐỘNG (rất quan trọng, cô hay hỏi):
//   1. Gửi email + mật khẩu lên Laravel.
//   2. Laravel kiểm tra đúng thì trả về TOKEN (một chuỗi dài, giống "thẻ ra vào")
//      và thông tin người dùng.
//   3. Mình cất token + thông tin vào localStorage của trình duyệt.
//      Tắt trình duyệt mở lại vẫn còn => vẫn đang đăng nhập.
//   4. Đăng xuất = báo Laravel huỷ token + xoá khỏi localStorage.
// =====================================================================

import { useMemo, useSyncExternalStore } from "react";
import { API, callApi } from "./api";

// ---------------------------------------------------------------------
// 1. KIỂU DỮ LIỆU
// ---------------------------------------------------------------------

// Thông tin người dùng Laravel trả về
export type User = {
  id: number;
  username: string;
  ho_ten: string;
  email: string;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  vai_tro: string; // "admin" hoặc "member"
};

// ---------------------------------------------------------------------
// 2. LƯU / ĐỌC PHIÊN ĐĂNG NHẬP TRONG localStorage
// ---------------------------------------------------------------------

const TOKEN_KEY = "auth_token"; // tên ngăn chứa token
const USER_KEY = "auth_user"; // tên ngăn chứa thông tin người dùng
const AUTH_CHANGED = "auth-changed"; // tên "tín hiệu" báo là vừa đăng nhập/đăng xuất

// Đọc 1 ngăn trong localStorage (try/catch phòng khi trình duyệt chặn localStorage)
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Lưu token + người dùng sau khi đăng nhập/đăng ký thành công
function saveSession(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // không lưu được thì thôi, bỏ qua
  }
  window.dispatchEvent(new Event(AUTH_CHANGED)); // báo cho Sidebar biết để cập nhật
}

// Xoá phiên đăng nhập
function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // bỏ qua
  }
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

// Lấy token hiện tại (null nếu chưa đăng nhập)
export function getToken(): string | null {
  return readStorage(TOKEN_KEY);
}

// ---------------------------------------------------------------------
// 3. ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT
// ---------------------------------------------------------------------

// Đăng nhập. formData có 2 trường: login (email hoặc username) và password.
// Sai mật khẩu thì callApi ném lỗi "Thông tin đăng nhập không đúng".
export async function login(formData: FormData): Promise<User> {
  const json = await callApi(`${API}/auth/dang-nhap`, { method: "POST", body: formData });
  saveSession(json.token, json.user);
  return json.user;
}

// Đăng ký. Đăng ký xong Laravel cũng trả token luôn => tự đăng nhập luôn.
export async function register(formData: FormData): Promise<User> {
  const json = await callApi(`${API}/auth/dang-ky`, { method: "POST", body: formData });
  saveSession(json.token, json.user);
  return json.user;
}

// Đăng xuất: báo Laravel huỷ token, rồi xoá khỏi trình duyệt.
// Nếu báo Laravel bị lỗi (vd: mất mạng) vẫn xoá ở trình duyệt để người dùng thoát ra được.
export async function logout() {
  const token = getToken();
  try {
    if (token) {
      await callApi(`${API}/auth/dang-xuat`, { method: "POST" }, token);
    }
  } catch {
    // bỏ qua lỗi
  }
  clearSession();
}

// ---------------------------------------------------------------------
// 4. HOOK: AI ĐANG ĐĂNG NHẬP?
// ---------------------------------------------------------------------

// Hàm để React "đăng ký nghe" mỗi khi phiên đăng nhập thay đổi
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // đăng xuất/đăng nhập ở tab khác
  window.addEventListener(AUTH_CHANGED, onChange); // đăng xuất/đăng nhập ở tab này
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED, onChange);
  };
}

// Trả về người dùng đang đăng nhập, hoặc null nếu chưa đăng nhập.
// Khi đăng nhập/đăng xuất, nơi nào dùng hook này sẽ tự vẽ lại.
//
// (useSyncExternalStore là cách React khuyên dùng để đọc dữ liệu nằm ngoài React,
//  ở đây là localStorage. Tham số thứ 3 là giá trị khi chạy trên server: chưa có ai đăng nhập.)
export function useCurrentUser(): User | null {
  const rawUser = useSyncExternalStore(
    subscribe,
    () => readStorage(USER_KEY),
    () => null
  );

  return useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null; // dữ liệu bị hỏng thì coi như chưa đăng nhập
    }
  }, [rawUser]);
}

// ---------------------------------------------------------------------
// 5. HỒ SƠ NGƯỜI DÙNG (trang /profile)
// ---------------------------------------------------------------------

// Cập nhật lại thông tin người dùng trong localStorage (giữ nguyên token),
// rồi báo cho Header biết để đổi tên hiển thị.
function updateStoredUser(user: User) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // bỏ qua
  }
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

// Lấy token, nếu chưa đăng nhập thì ném lỗi
function requireToken(): string {
  const token = getToken();
  if (!token) throw new Error("Bạn chưa đăng nhập.");
  return token;
}

// Lấy thông tin mới nhất của người đang đăng nhập từ Laravel.
// Token hết hạn / bị huỷ (Laravel báo "Unauthenticated.") thì xoá phiên luôn.
export async function fetchMe(): Promise<User> {
  const token = requireToken();
  try {
    const user = (await callApi(`${API}/auth/me`, { cache: "no-store" }, token)) as User;
    updateStoredUser(user);
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthenticated")) clearSession();
    throw error;
  }
}

// Sửa hồ sơ. data gồm: ho_ten, email, so_dien_thoai, dia_chi
// (dùng JSON vì Laravel không đọc được FormData khi gửi bằng PUT)
export async function updateProfile(data: Record<string, string>): Promise<User> {
  const json = await callApi(
    `${API}/auth/me`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
    requireToken()
  );
  updateStoredUser(json.user);
  return json.user;
}

// Đổi mật khẩu. data gồm: mat_khau_hien_tai, password, password_confirmation
export async function changePassword(data: Record<string, string>): Promise<string> {
  const json = await callApi(
    `${API}/auth/doi-mat-khau`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
    requireToken()
  );
  return json.message;
}
