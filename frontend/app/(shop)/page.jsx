"use client";

// =====================================================================
// TRANG CHỦ  ->  mở bằng đường link /
//
// Hiện 4 nhóm sản phẩm (mỗi nhóm 4 món):
//   1. Mới nhất  : sản phẩm vừa thêm
//   2. Bán chạy  : sản phẩm có nhiều lượt xem nhất (hot)
//   3. Khuyến mãi: sản phẩm đang giảm giá (sale)
//   4. Nổi bật   : sản phẩm còn hàng có giá cao nhất (feature)
//
// Cách làm: gọi API 1 lần lấy danh sách sản phẩm, rồi tự lọc / sắp xếp ra 4 nhóm.
// =====================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/services/productServices";
import { isOnSale } from "@/utils/priceHelper";
import { addToCart } from "@/utils/cartHelper";
import ProductList from "@/components/shop/product/ProductList";

export default function ShopHomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products } = await getProducts({ per_page: 100 });

        // 1. Mới nhất: API đã sắp xếp sản phẩm mới nhất lên đầu, chỉ cần lấy 4 món đầu
        setNewProducts(products.slice(0, 4));

        // 2. Bán chạy: sắp xếp theo lượt xem giảm dần
        const byViews = [...products].sort((a, b) => b.luot_xem - a.luot_xem);
        setHotProducts(byViews.slice(0, 4));

        // 3. Khuyến mãi: chỉ giữ sản phẩm đang giảm giá
        setSaleProducts(products.filter(isOnSale).slice(0, 4));

        // 4. Nổi bật: sản phẩm còn hàng, sắp xếp theo giá giảm dần
        const inStock = products.filter((p) => Number(p.so_luong) > 0);
        const byPrice = inStock.sort((a, b) => Number(b.gia) - Number(a.gia));
        setFeaturedProducts(byPrice.slice(0, 4));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const result = addToCart(product);
    alert(result.message); // "HẾT HÀNG" nếu kho < 1
  };

  // Danh sách 4 khối cần hiển thị (để khỏi viết lặp lại 4 lần)
  const sections = [
    { label: "New Arrival", title: "Sản phẩm mới", desc: "Những sản phẩm vừa được cập nhật.", color: "text-blue-600", products: newProducts },
    { label: "Hot", title: "Bán chạy nhất", desc: "Được xem nhiều nhất gần đây.", color: "text-orange-500", products: hotProducts },
    { label: "Sale", title: "Đang khuyến mãi", desc: "Giá tốt, số lượng có hạn.", color: "text-red-500", products: saleProducts },
    { label: "Featured", title: "Sản phẩm nổi bật", desc: "Lựa chọn cao cấp cho bạn.", color: "text-emerald-600", products: featuredProducts },
  ];

  return (
    <div>
      {/* ---------- Banner ---------- */}
      <section className="mx-auto mt-6 max-w-7xl px-6">
        <div className="rounded-3xl bg-linear-to-r from-blue-700 to-sky-500 px-8 py-16 text-white sm:px-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-100">Bộ sưu tập mới</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            Mua sắm dễ dàng, giá tốt mỗi ngày
          </h1>
          <p className="mt-4 max-w-lg text-sky-100">
            Hàng ngàn sản phẩm chính hãng, giao nhanh tận nơi, đổi trả dễ dàng.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-blue-700 transition hover:bg-sky-50"
          >
            Mua ngay →
          </Link>
        </div>
      </section>

      {/* ---------- Các nhóm sản phẩm ---------- */}
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {loading && <p className="text-center text-slate-500">Đang tải sản phẩm...</p>}

        {error && <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}

        {!loading &&
          !error &&
          sections.map((section) => (
            <section key={section.label} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <span className={`text-sm font-semibold uppercase tracking-wider ${section.color}`}>
                    {section.label}
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{section.desc}</p>
                </div>

                <Link href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>

              <ProductList products={section.products} onAddToCart={handleAddToCart} />
            </section>
          ))}
      </div>
    </div>
  );
}
