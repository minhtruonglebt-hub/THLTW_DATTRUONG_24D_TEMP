"use client";

// =====================================================================
// THANH MENU TRÊN CÙNG của khu vực cửa hàng (hiện ở mọi trang trong (shop))
//   - Logo + các link: Trang chủ, Sản phẩm
//   - Ô tìm kiếm: gõ xong bấm Enter -> sang /products?keyword=...
//   - Giỏ hàng (có số lượng)
//   - Chưa đăng nhập: link Đăng nhập / Đăng ký
//     Đã đăng nhập  : hiện tên người dùng + nút Đăng xuất
// =====================================================================

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API, callApi } from "@/lib/api";
import { getCartCount } from "@/utils/cartHelper";
import { logout, useCurrentUser } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser(); // null = chưa đăng nhập
  const [keyword, setKeyword] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [website, setWebsite] = useState(null);
  const [dynamicMenu, setDynamicMenu] = useState([]);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Cập nhật số trên giỏ hàng: lúc mở trang + mỗi khi giỏ thay đổi
  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      callApi(`${API}/cau-hinh-website`, { cache: "no-store" }),
      callApi(`${API}/menu`, { cache: "no-store" }),
    ]).then(([settings, menu]) => {
      if (!active) return;
      setWebsite(settings.data ?? null);
      setDynamicMenu(menu.data ?? []);
    }).catch(() => {
      if (active) {
        setWebsite(null);
        setDynamicMenu([]);
      }
    });
    return () => { active = false; };
  }, []);

  // Bấm Enter ở ô tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  // Bấm Đăng xuất
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="shop-header sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)] backdrop-blur-xl">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium tracking-wide text-slate-200">
        Giao hàng nhanh toàn quốc <span className="mx-2 text-slate-500">•</span> Ưu đãi mới mỗi ngày
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:gap-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:-rotate-6 group-hover:scale-105 sm:h-10 sm:w-10 sm:text-lg">S</span>
          <span className="max-w-[7.5rem] truncate text-sm font-extrabold tracking-tight text-slate-900 sm:max-w-48 sm:text-xl">
            {website?.ten_website || "Cửa hàng"}
          </span>
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full sm:order-none sm:ml-auto sm:flex-1 sm:max-w-md">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400" aria-hidden="true">⌕</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm sản phẩm bạn cần..."
              aria-label="Tìm sản phẩm"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:gap-3">
          <Link href="/cart" aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ""}`} className="relative inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-3">
            <span aria-hidden="true">🛒</span><span className="hidden sm:inline">Giỏ hàng</span>
            {cartCount > 0 && <span className="grid min-w-5 h-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="relative">
              <button type="button" aria-expanded={accountMenuOpen} aria-haspopup="menu" onClick={() => setAccountMenuOpen((open) => !open)} className="inline-flex max-w-40 items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{(user.ho_ten || user.username || "U").slice(0, 1).toUpperCase()}</span>
                <span className="hidden truncate sm:inline">{user.ho_ten || user.username}</span>
                <span aria-hidden="true" className="text-xs text-slate-400">{accountMenuOpen ? "▴" : "▾"}</span>
              </button>
              <div role="menu" className={`${accountMenuOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"} absolute right-0 top-full z-40 mt-2 min-w-44 rounded-xl border border-slate-100 bg-white p-2 shadow-xl transition`}>
                <Link role="menuitem" href="/profile" onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Tài khoản của tôi</Link>
                {user.vai_tro === "admin" && <Link role="menuitem" href="/admin" onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Quản trị</Link>}
                <button role="menuitem" type="button" onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Đăng xuất</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700 sm:px-3">Đăng nhập</Link>
              <Link href="/register" className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex">Tạo tài khoản</Link>
            </div>
          )}
        </div>
      </div>
      <nav className="border-t border-slate-100">
        <div className="shop-nav-scroll mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {(dynamicMenu.length > 0 ? dynamicMenu : [
            { id: "home", ten_menu: "Trang chủ", url: "/" },
            { id: "products", ten_menu: "Sản phẩm", url: "/products" },
            { id: "posts", ten_menu: "Bài viết", url: "/posts" },
            { id: "contact", ten_menu: "Liên hệ", url: "/contact" },
          ]).map((item) => {
            const href = item.url || "/";
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return <Link key={item.id} href={href} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}>{item.ten_menu}</Link>;
          })}
        </div>
      </nav>
    </header>
  );
}
