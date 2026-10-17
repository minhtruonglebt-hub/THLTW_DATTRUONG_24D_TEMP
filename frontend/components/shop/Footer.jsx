// Chân trang của khu vực cửa hàng

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-white">Cửa hàng</h3>
          <p className="mt-3 text-sm leading-6">
            Mua sắm trực tuyến dễ dàng, sản phẩm chính hãng, giao hàng nhanh chóng.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">Liên kết</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Liên hệ</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Email: cuahang@example.com</li>
            <li>Hotline: 0123 456 789</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © 2026 Cửa hàng. Đồ án môn học.
      </div>
    </footer>
  );
}
