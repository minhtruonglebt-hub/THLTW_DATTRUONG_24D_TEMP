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
import Image from "next/image";
import { API, callApi } from "@/lib/api";
import { mediaUrl } from "@/lib/format";

export default function ShopHomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

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

  useEffect(() => {
    let active = true;
    callApi(`${API}/banner`, { cache: "no-store" })
      .then((json) => active && setBanner((json.data ?? [])[0] ?? null))
      .catch(() => active && setBanner(null));
    return () => { active = false; };
  }, []);

  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
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
    <div className="pb-4">
      {/* ---------- Banner ---------- */}
      <section className="mx-auto mt-5 max-w-7xl px-4 sm:mt-8 sm:px-6">
        <Link href={banner?.lien_ket || "/products"} className="group relative isolate block min-h-[390px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-12 text-white shadow-2xl shadow-blue-950/15 sm:min-h-[440px] sm:px-12 sm:py-16 lg:px-16">
          {banner?.hinh_anh && <Image src={mediaUrl(banner.hinh_anh)} alt={banner.tieu_de || "Banner cửa hàng"} fill priority unoptimized className="object-cover" />}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl transition duration-700 group-hover:scale-125" />
            <div className="absolute -bottom-48 right-1/4 h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_35%)]" />
          </div>
          <div className="relative z-10 flex min-h-[300px] max-w-3xl flex-col items-start justify-center sm:min-h-[330px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />Bộ sưu tập mới
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{banner?.tieu_de || "Công nghệ tốt hơn. Mỗi ngày."}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/90 sm:text-lg">Khám phá sản phẩm chính hãng, mức giá tốt và trải nghiệm mua sắm dễ dàng cho mọi nhu cầu.</p>
            <span className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-black/10 transition group-hover:-translate-y-0.5 group-hover:bg-blue-50">Khám phá sản phẩm <span aria-hidden="true">→</span></span>
          </div>
          <div className="absolute bottom-8 right-8 hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-right backdrop-blur-md sm:block">
            <p className="text-2xl font-black">Chính hãng</p><p className="mt-1 text-xs text-blue-100">An tâm lựa chọn</p>
          </div>
        </Link>
      </section>

      {/* ---------- Các nhóm sản phẩm ---------- */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        {loading && <p className="text-center text-slate-500">Đang tải sản phẩm...</p>}

        {error && <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}

        {!loading &&
          !error &&
          sections.map((section) => (
            <section key={section.label} className="rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-34px_rgba(15,23,42,0.45)] sm:p-8">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <span className={`text-[11px] font-extrabold uppercase tracking-[0.2em] ${section.color}`}>
                    {section.label}
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{section.desc}</p>
                </div>

                <Link href="/products" className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                  Xem tất cả <span aria-hidden="true">→</span>
                </Link>
              </div>

              <ProductList products={section.products} onAddToCart={handleAddToCart} />
            </section>
          ))}
      </div>
    </div>
  );
}
