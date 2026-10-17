// =====================================================================
// THẺ HIỂN THỊ 1 SẢN PHẨM (ảnh, tên, giá, nút thêm vào giỏ)
// Dùng ở trang chủ và trang danh sách sản phẩm.
//
//   product     : 1 sản phẩm lấy từ API
//   onAddToCart : hàm chạy khi bấm "Thêm vào giỏ" (do trang cha truyền xuống)
// =====================================================================

import Link from "next/link";
import { money, mediaUrl } from "@/lib/format";
import { isOnSale, getPrice, getDiscountPercent } from "@/utils/priceHelper";

export default function ProductCard({ product, onAddToCart }) {
  const imageUrl = mediaUrl(product.hinh_anh_url);
  const outOfStock = Number(product.so_luong) <= 0; // hết hàng?

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg">
      {/* Ảnh sản phẩm (bấm vào để xem chi tiết) */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.ten_san_pham}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Chưa có ảnh</div>
        )}

        {/* Nhãn giảm giá / hết hàng */}
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded bg-slate-700 px-2 py-1 text-xs font-semibold text-white">
            Hết hàng
          </span>
        ) : (
          isOnSale(product) && (
            <span className="absolute left-3 top-3 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{getDiscountPercent(product)}%
            </span>
          )
        )}
      </Link>

      {/* Thông tin */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-400">{product.thuong_hieu?.name ?? ""}</p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-10 text-sm font-medium text-slate-800 hover:text-blue-600"
        >
          {product.ten_san_pham}
        </Link>

        {/* Giá */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-red-600">{money(getPrice(product))}</span>
          {isOnSale(product) && (
            <span className="text-sm text-slate-400 line-through">{money(product.gia)}</span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={outOfStock}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
}
