// Chân trang của khu vực cửa hàng

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 font-black text-white">S</span>
            <h3 className="text-lg font-bold text-white">Cửa hàng</h3>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
            Mua sắm trực tuyến dễ dàng, sản phẩm chính hãng, giao hàng nhanh chóng.
          </p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Mua sắm an tâm • Giao hàng tận nơi</p>
        </div>

        <div>
          <h3 className="font-semibold text-white">Khám phá</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/" className="transition hover:text-blue-300">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/products" className="transition hover:text-blue-300">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/posts" className="transition hover:text-blue-300">
                Bài viết
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-blue-300">
                Liên hệ
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-blue-300">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Cần hỗ trợ?</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>Email: cuahang@example.com</li>
            <li>Hotline: 0123 456 789</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Cửa hàng. Đồ án môn học.</span>
          <span>Thanh toán an toàn · Hỗ trợ tận tâm</span>
        </div>
      </div>
    </footer>
  );
}
