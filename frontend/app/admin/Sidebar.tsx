"use client";

// =====================================================================
// FILE NÀY LÀ GÌ?
// Menu bên trái của trang quản trị.
//   - Các mục menu tự sinh từ RESOURCES (lib/admin-config.tsx)
//   - Dưới cùng là khu vực tài khoản:
//       đã đăng nhập  -> hiện tên + nút "Đăng xuất"
//       chưa đăng nhập -> hiện link "Đăng nhập" / "Đăng ký"
// =====================================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RESOURCES } from "@/lib/admin-config";
import { logout, useCurrentUser } from "@/lib/auth";

export default function Sidebar() {
  const currentPath = usePathname(); // đường dẫn hiện tại, vd: "/admin/san-pham"
  const router = useRouter();
  const user = useCurrentUser(); // người đang đăng nhập (null nếu chưa)

  // Menu = "Tổng quan" + tất cả các mục quản lý
  const menuItems = [{ key: "", title: "Tổng quan" }, ...RESOURCES];

  // Bấm "Đăng xuất": huỷ phiên đăng nhập rồi về trang đăng nhập
  async function handleLogout() {
    await logout();
    router.push("/dang-nhap");
  }

  return (
    // flex-col để đẩy khu vực tài khoản xuống đáy (mt-auto bên dưới)
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-slate-950 px-4 py-6 text-slate-400">
      {/* Tên cửa hàng */}
      <div className="mb-8 px-3">
        <div className="text-lg font-semibold text-white">Cửa hàng</div>
        <div className="text-xs text-slate-500">Bảng quản trị</div>
      </div>

      {/* Danh sách menu */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          // "Tổng quan" có key rỗng -> đi tới /admin
          const href = item.key ? `/admin/${item.key}` : "/admin";
          const isActive = currentPath === href; // đang ở trang này?

          // Mục đang chọn: viền xanh + nền đậm + chữ trắng
          const activeStyle = "border-teal-400 bg-slate-800 font-medium text-white";
          const normalStyle = "border-transparent hover:bg-slate-900 hover:text-slate-200";

          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg border-l-2 px-3 py-2 text-sm transition-colors ${isActive ? activeStyle : normalStyle}`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Khu vực tài khoản (nằm dưới đáy) */}
      <div className="mt-auto border-t border-slate-800 pt-4">
        {user ? (
          // --- Đã đăng nhập ---
          <div className="px-3">
            <div className="truncate text-sm font-medium text-white">{user.ho_ten}</div>
            <div className="truncate text-xs text-slate-500">
              {user.vai_tro === "admin" ? "Quản trị viên" : "Thành viên"}
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          // --- Chưa đăng nhập ---
          <div className="flex flex-col gap-1">
            <Link href="/dang-nhap" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-900 hover:text-slate-200">
              Đăng nhập
            </Link>
            <Link href="/dang-ky" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-900 hover:text-slate-200">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
