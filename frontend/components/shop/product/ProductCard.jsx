// =====================================================================
// THẺ HIỂN THỊ 1 SẢN PHẨM (ảnh, tên, giá, nút thêm vào giỏ)
// Dùng ở trang chủ và trang danh sách sản phẩm.
//
//   product     : 1 sản phẩm lấy từ API
//   onAddToCart : hàm chạy khi bấm "Thêm vào giỏ" (do trang cha truyền xuống)
// =====================================================================

import Link from "next/link";
import Image from "next/image";
import { money, mediaUrl } from "@/lib/format";
import { isOnSale, getPrice, getDiscountPercent } from "@/utils/priceHelper";

export default function ProductCard({ product, onAddToCart }) {
  const imageUrl = mediaUrl(product.hinh_anh_url);
  const outOfStock = Number(product.so_luong) <= 0; // hết hàng?

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_8px_28px_-22px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10">
      {/* Ảnh sản phẩm (bấm vào để xem chi tiết) */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/60">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.ten_san_pham}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-medium text-slate-400"><span className="text-3xl opacity-50">▧</span>Chưa có ảnh</div>
        )}

        {/* Nhãn giảm giá / hết hàng */}
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Hết hàng
          </span>
        ) : (
          isOnSale(product) && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              -{getDiscountPercent(product)}%
            </span>
          )
        )}
      </Link>

      {/* Thông tin */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">{product.thuong_hieu?.ten_thuong_hieu ?? product.thuong_hieu?.name ?? ""}</p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-6 text-slate-800 transition hover:text-blue-600"
        >
          {product.ten_san_pham}
        </Link>

        {/* Giá */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-slate-950">{money(getPrice(product))}</span>
          {isOnSale(product) && (
            <span className="text-sm text-slate-400 line-through">{money(product.gia)}</span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={outOfStock}
          className="mt-5 w-full rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </article>
  );
}
