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
import { useRouter } from "next/navigation";
import { getCartCount } from "@/utils/cartHelper";
import { logout, useCurrentUser } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const user = useCurrentUser(); // null = chưa đăng nhập
  const [keyword, setKeyword] = useState("");
  const [cartCount, setCartCount] = useState(0);

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Cửa hàng
        </Link>

        {/* Menu */}
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-blue-600">
            Sản phẩm
          </Link>
        </nav>

        {/* Tìm kiếm */}
        <form onSubmit={handleSearch} className="ml-auto hidden flex-1 sm:block sm:max-w-md">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
        </form>

        {/* Giỏ hàng + Tài khoản */}
        <div className="ml-auto flex items-center gap-5 text-sm font-medium text-slate-700 sm:ml-0">
          <Link href="/cart" className="relative hover:text-blue-600">
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/profile" className="hover:text-blue-600">
                👤 {user.ho_ten || user.username}
              </Link>
              {user.vai_tro === "admin" && (
                <Link href="/admin" className="hover:text-blue-600">
                  Quản trị
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="hover:text-blue-600">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">
                Đăng nhập
              </Link>
              <Link href="/register" className="hover:text-blue-600">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
