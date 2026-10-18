"use client";

// =====================================================================
// FILE NÀY LÀ GÌ?
// Menu bên trái của trang quản trị.
//   - Các mục menu lấy từ MENU (lib/menu.ts)
//   - Dưới cùng là khu vực tài khoản:
//       đã đăng nhập  -> hiện tên + nút "Đăng xuất"
//       chưa đăng nhập -> hiện link "Đăng nhập"
// =====================================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MENU } from "@/lib/menu";
import { logout, useCurrentUser } from "@/lib/auth";

export default function AdminSidebar() {
  const currentPath = usePathname(); // đường dẫn hiện tại, vd: "/admin/products"
  const router = useRouter();
  const user = useCurrentUser(); // người đang đăng nhập (null nếu chưa)

  // Menu = "Tổng quan" + tất cả các mục quản lý
  const menuItems = [{ key: "", path: "", title: "Tổng quan" }, ...MENU];

  // Bấm "Đăng xuất": huỷ phiên đăng nhập rồi về trang đăng nhập
  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    // flex-col để đẩy khu vực tài khoản xuống đáy (mt-auto bên dưới)
    <aside className="sticky top-0 z-20 flex w-full shrink-0 flex-col bg-slate-950 px-3 py-3 text-slate-400 md:h-screen md:w-60 md:overflow-y-auto md:px-4 md:py-6">
      {/* Tên cửa hàng */}
      <div className="mb-8 rounded-xl bg-slate-900 px-3 py-4">
        <div className="text-lg font-semibold text-white">Cửa hàng</div>
        <div className="mt-1 text-xs text-slate-500">Bảng quản trị</div>
      </div>

      {/* Danh sách menu */}
      <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:flex md:flex-col">
        {menuItems.map((item) => {
          // "Tổng quan" có key rỗng -> đi tới /admin
          const href = item.path ? `/admin/${item.path}` : "/admin";
          // đang ở trang này? (mục con như /create, /{id} vẫn tô sáng mục cha)
          const isActive = item.path ? currentPath === href || currentPath.startsWith(`${href}/`) : currentPath === href;

          // Mục đang chọn: viền xanh + nền đậm + chữ trắng
          const activeStyle = "border-teal-400 bg-slate-800 font-medium text-white";
          const normalStyle = "border-transparent hover:bg-slate-900 hover:text-slate-200";

          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors ${isActive ? activeStyle : normalStyle}`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Khu vực tài khoản (nằm dưới đáy) */}
      <div className="mt-4 border-t border-slate-800 pt-3 md:mt-auto md:pt-4">
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
            <Link href="/admin/login" className="rounded-lg px-3 py-2 text-sm hover:bg-slate-900 hover:text-slate-200">
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
