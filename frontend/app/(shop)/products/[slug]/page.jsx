"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductList from "@/components/shop/product/ProductList";
import { getProductBySlug, getRelatedProducts } from "@/services/productServices";
import { mediaUrl, money } from "@/lib/format";
import { addToCart } from "@/utils/cartHelper";
import { getPrice, isOnSale } from "@/utils/priceHelper";

function ProductImage({ src, alt, className = "" }) {
  const imageUrl = mediaUrl(src);

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-sm text-slate-400 ${className}`}>
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    setLoading(true);
    setRelatedLoading(false);
    setError("");
    setProduct(null);
    setRelatedProducts([]);
    setSelectedImage("");
    setQuantity(1);

    getProductBySlug(slug)
      .then(async (currentProduct) => {
        if (!isCurrentRequest) return;

        setProduct(currentProduct);
        setSelectedImage(currentProduct.hinh_anh_url || "");
        setLoading(false);

        setRelatedLoading(true);
        try {
          const products = await getRelatedProducts(currentProduct.slug || currentProduct.id, 4);
          if (isCurrentRequest) {
            setRelatedProducts(products);
          }
        } catch (relatedError) {
          console.error("Không tải được sản phẩm liên quan:", relatedError);
        } finally {
          if (isCurrentRequest) setRelatedLoading(false);
        }
      })
      .catch((cause) => {
        if (isCurrentRequest) {
          setError(cause instanceof Error ? cause.message : "Không tải được thông tin sản phẩm.");
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  if (loading) {
    return <p className="mx-auto max-w-7xl px-6 py-20 text-center text-slate-500">Đang tải sản phẩm...</p>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-red-700">{error || "Không tìm thấy sản phẩm."}</p>
        <Link href="/products" className="mt-5 inline-block font-semibold text-blue-600 hover:underline">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const stock = Math.max(0, Number(product.so_luong) || 0);
  const gallery = [
    product.hinh_anh_url,
    ...(product.hinh_anhs ?? [])
      .filter((image) => image.status !== false)
      .map((image) => image.url ?? image.hinh_anh_url ?? image.hinh_anh),
  ].filter(Boolean);
  const categoryName = product.danh_muc?.ten_danh_muc;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
      <nav aria-label="Điều hướng" className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
        {categoryName && <span className="mx-2">/ {categoryName}</span>}
      </nav>

      <section className="grid gap-8 rounded-3xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-50">
            <ProductImage
              src={selectedImage || product.hinh_anh_url}
              alt={product.ten_san_pham}
              className="h-full w-full object-contain"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Xem ảnh ${index + 1} của ${product.ten_san_pham}`}
                  aria-pressed={selectedImage === image}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 ${selectedImage === image ? "border-blue-600" : "border-transparent"}`}
                >
                  <ProductImage src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.thuong_hieu?.name && (
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {product.thuong_hieu.name}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{product.ten_san_pham}</h1>
          {product.mo_ta_ngan && <p className="mt-4 leading-7 text-slate-600">{product.mo_ta_ngan}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-red-600">{money(getPrice(product))}</span>
            {isOnSale(product) && (
              <span className="text-lg text-slate-400 line-through">{money(product.gia)}</span>
            )}
          </div>

          <p className={`mt-4 text-sm font-medium ${stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
            {stock > 0 ? `Còn ${stock} sản phẩm` : "Sản phẩm hiện đã hết hàng"}
          </p>

          {stock > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label htmlFor="product-quantity" className="text-sm font-medium text-slate-700">Số lượng</label>
              <input
                id="product-quantity"
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value);
                  setQuantity(Math.min(stock, Math.max(1, nextQuantity || 1)));
                }}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-center outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Mô tả sản phẩm</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {product.mo_ta || product.mo_ta_ngan || "Sản phẩm chưa có mô tả chi tiết."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Có thể bạn cũng thích</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Sản phẩm liên quan</h2>
          <p className="mt-1 text-sm text-slate-500">
            {categoryName ? `Sản phẩm khác trong danh mục ${categoryName}.` : "Các sản phẩm cùng danh mục."}
          </p>
        </div>

        {relatedLoading ? (
          <p className="py-8 text-center text-slate-500">Đang tải sản phẩm liên quan...</p>
        ) : relatedProducts.length > 0 ? (
          <ProductList products={relatedProducts} onAddToCart={(item) => {
            addToCart(item);
            alert("Đã thêm vào giỏ hàng");
          }} />
        ) : (
          <p className="py-8 text-center text-slate-500">Chưa có sản phẩm khác trong danh mục này.</p>
        )}
      </section>
    </div>
  );
}
