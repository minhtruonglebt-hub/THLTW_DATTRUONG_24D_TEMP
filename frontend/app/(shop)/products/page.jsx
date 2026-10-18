"use client";

// =====================================================================
// TRANG DANH SÁCH SẢN PHẨM  ->  mở bằng đường link /products
//
// Có: phân trang, lọc theo danh mục / khoảng giá / thương hiệu, sắp xếp, tìm theo từ khoá
// (từ khoá lấy từ đường link, vd: /products?keyword=áo — do ô tìm kiếm ở Header gửi sang).
//
// Cách làm (dễ hiểu):
//   1. Gọi API LẤY TẤT CẢ sản phẩm 1 lần, cùng với danh mục và thương hiệu.
//   2. Mỗi khi đổi bộ lọc -> tự lọc lại danh sách ngay trong trình duyệt.
//   3. Cắt danh sách ra từng trang (mỗi trang PAGE_SIZE sản phẩm) để phân trang.
// =====================================================================

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/services/productServices";
import { getCategories } from "@/services/categoryServices";
import { getBrands } from "@/services/brandServices";
import { getPrice } from "@/utils/priceHelper";
import { addToCart } from "@/utils/cartHelper";
import ProductList from "@/components/shop/product/ProductList";
import ProductFilter from "@/components/shop/product/ProductFilter";
import Pagination from "@/components/common/Pagination";

const PAGE_SIZE = 9; // mỗi trang hiện 9 sản phẩm

// useSearchParams (đọc đường link) bắt buộc phải nằm trong <Suspense> của Next.js
export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-500">Đang tải...</p>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") ?? ""; // từ khoá tìm kiếm trên đường link

  // Dữ liệu lấy từ API
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Các bộ lọc đang chọn ("" nghĩa là không lọc)
  const [categoryId, setCategoryId] = useState(searchParams.get("category") ?? "");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // ---------- 1. Lấy dữ liệu từ API (chạy 1 lần khi mở trang) ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResult, categoryList, brandList] = await Promise.all([
          getProducts({ per_page: 1000 }),
          getCategories(),
          getBrands(),
        ]);
        setAllProducts(productResult.products);
        setCategories(categoryList);
        setBrands(brandList);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- 2. Các hàm đổi bộ lọc (đổi xong thì quay về trang 1) ----------
  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setCurrentPage(1);
  };
  const handleBrandChange = (value) => {
    setBrandId(value);
    setCurrentPage(1);
  };
  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setCurrentPage(1);
  };
  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setCurrentPage(1);
  };
  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1);
  };
  const handleReset = () => {
    setCategoryId("");
    setBrandId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu trang
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert("Đã thêm vào giỏ hàng");
  };

  // ---------- 3. Lọc danh sách ----------

  // Nếu chọn danh mục CHA thì lấy luôn sản phẩm của các danh mục CON
  let selectedCategoryIds = [];
  if (categoryId !== "") {
    selectedCategoryIds = [Number(categoryId)];
    const parent = categories.find((c) => c.id === Number(categoryId));
    if (parent) {
      (parent.children ?? []).forEach((child) => selectedCategoryIds.push(child.id));
    }
  }

  const filteredProducts = allProducts.filter((product) => {
    // Từ khoá: tên sản phẩm có chứa từ khoá (không phân biệt hoa thường)
    if (keyword && !product.ten_san_pham.toLowerCase().includes(keyword.toLowerCase())) return false;

    // Danh mục
    if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(product.danh_muc_id)) return false;

    // Thương hiệu
    if (brandId !== "" && product.thuong_hieu_id !== Number(brandId)) return false;

    // Khoảng giá (tính theo giá khách phải trả: có khuyến mãi thì lấy giá khuyến mãi)
    const price = getPrice(product);
    if (minPrice !== "" && price < Number(minPrice)) return false;
    if (maxPrice !== "" && price > Number(maxPrice)) return false;

    return true;
  });

  // ---------- 4. Sắp xếp ----------
  const sortedProducts = [...filteredProducts];
  if (sort === "price_asc") sortedProducts.sort((a, b) => getPrice(a) - getPrice(b));
  if (sort === "price_desc") sortedProducts.sort((a, b) => getPrice(b) - getPrice(a));
  if (sort === "name") sortedProducts.sort((a, b) => a.ten_san_pham.localeCompare(b.ten_san_pham, "vi"));

  // ---------- 5. Phân trang: cắt ra đúng 1 trang ----------
  const pageCount = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const page = Math.min(currentPage, pageCount || 1); // phòng khi lọc xong còn ít trang hơn
  const pagedProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Tiêu đề + sắp xếp */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {keyword ? `Kết quả cho "${keyword}"` : "Tất cả sản phẩm"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{sortedProducts.length} sản phẩm</p>
        </div>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="default">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Cột trái: bộ lọc */}
        <ProductFilter
          categories={categories}
          brands={brands}
          categoryId={categoryId}
          brandId={brandId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onMinPriceChange={handleMinPriceChange}
          onMaxPriceChange={handleMaxPriceChange}
          onReset={handleReset}
        />

        {/* Cột phải: danh sách + phân trang */}
        <div>
          {loading ? (
            <p className="py-10 text-center text-slate-500">Đang tải sản phẩm...</p>
          ) : (
            <>
              <ProductList
                products={pagedProducts}
                onAddToCart={handleAddToCart}
                gridClass="grid-cols-2 lg:grid-cols-3"
              />

              <div className="mt-10">
                <Pagination currentPage={page} pageCount={pageCount} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
