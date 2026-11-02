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
  const icons: Record<string, string> = {
    "": "⌂", "danh-muc": "▦", "thuong-hieu": "◇", "san-pham": "▣",
    "don-hang": "▤", "lien-he": "✉", "bai-viet": "▧", "chu-de-bai-viet": "◉",
    "trang-don": "▱", "muc-menu": "☷", banner: "▣", "khuyen-mai": "%",
    "phieu-kho": "▥", "gio-hang": "🛒", "nguoi-dung": "♙", "cau-hinh-website": "⚙",
  };

  // Bấm "Đăng xuất": huỷ phiên đăng nhập rồi về trang đăng nhập
  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    // flex-col để đẩy khu vực tài khoản xuống đáy (mt-auto bên dưới)
    <aside className="sticky top-0 z-20 flex w-full shrink-0 flex-col bg-slate-950 px-3 py-3 text-slate-400 md:h-screen md:w-[272px] md:overflow-y-auto md:px-5 md:py-6">
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/60 px-3 py-4 md:mb-8">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-950/40">S</div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold tracking-tight text-white">Cửa hàng</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Bảng quản trị</div>
        </div>
      </div>

      {/* Danh sách menu */}
      <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:flex md:flex-col md:gap-1">
        {menuItems.map((item) => {
          // "Tổng quan" có key rỗng -> đi tới /admin
          const href = item.path ? `/admin/${item.path}` : "/admin";
          // đang ở trang này? (mục con như /create, /{id} vẫn tô sáng mục cha)
          const isActive = item.path ? currentPath === href || currentPath.startsWith(`${href}/`) : currentPath === href;

          // Mục đang chọn: viền xanh + nền đậm + chữ trắng
          const activeStyle = "border-blue-400 bg-blue-500/15 font-semibold text-white shadow-sm";
          const normalStyle = "border-transparent text-slate-400 hover:bg-white/5 hover:text-white";

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm transition-colors ${isActive ? activeStyle : normalStyle}`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm ${isActive ? "bg-blue-500/20 text-blue-200" : "bg-white/5 text-slate-500"}`} aria-hidden="true">{icons[item.key] ?? "·"}</span>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Khu vực tài khoản (nằm dưới đáy) */}
      <div className="mt-4 border-t border-white/10 pt-4 md:mt-auto md:pt-5">
        {user ? (
          // --- Đã đăng nhập ---
          <div className="flex items-center gap-3 px-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-800 text-sm font-bold text-blue-200">{(user.ho_ten || "A").slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{user.ho_ten}</div>
            <div className="truncate text-xs text-slate-500">
              {user.vai_tro === "admin" ? "Quản trị viên" : "Thành viên"}
            </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              Thoát
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
