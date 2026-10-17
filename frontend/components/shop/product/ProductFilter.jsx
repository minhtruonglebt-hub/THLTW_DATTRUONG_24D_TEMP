// =====================================================================
// CỘT BỘ LỌC BÊN TRÁI của trang sản phẩm:
//   1. Danh mục   (bấm chọn 1 danh mục)
//   2. Khoảng giá (nhập giá thấp nhất / cao nhất)
//   3. Thương hiệu (chọn 1 thương hiệu)
//
// Component này chỉ HIỂN THỊ. Giá trị đang chọn và các hàm xử lý do trang cha truyền xuống.
// =====================================================================

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500";

export default function ProductFilter({
  categories,
  brands,
  categoryId,
  brandId,
  minPrice,
  maxPrice,
  onCategoryChange,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) {
  // Nút danh mục: đang chọn thì tô xanh
  const categoryButton = (id, name, isChild) => (
    <button
      key={id}
      onClick={() => onCategoryChange(String(id))}
      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
        isChild ? "pl-7" : "font-medium"
      } ${
        String(categoryId) === String(id)
          ? "bg-blue-50 text-blue-700"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {name}
    </button>
  );

  return (
    <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Bộ lọc</h2>
        <button onClick={onReset} className="text-sm text-blue-600 hover:underline">
          Xoá lọc
        </button>
      </div>

      {/* ----- Danh mục ----- */}
      <div className="border-t border-slate-100 py-4">
        <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Danh mục</h3>

        <button
          onClick={() => onCategoryChange("")}
          className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
            categoryId === "" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Tất cả
        </button>

        {categories.map((category) => (
          <div key={category.id}>
            {categoryButton(category.id, category.ten_danh_muc, false)}
            {/* Danh mục con thụt vào bên dưới */}
            {(category.children ?? []).map((child) => categoryButton(child.id, child.ten_danh_muc, true))}
          </div>
        ))}
      </div>

      {/* ----- Khoảng giá ----- */}
      <div className="border-t border-slate-100 py-4">
        <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Khoảng giá (₫)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="Từ"
            className={inputClass}
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Đến"
            className={inputClass}
          />
        </div>
      </div>

      {/* ----- Thương hiệu ----- */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Thương hiệu</h3>

        <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-slate-700">
          <input
            type="radio"
            name="brand"
            checked={brandId === ""}
            onChange={() => onBrandChange("")}
            className="h-4 w-4 accent-blue-600"
          />
          Tất cả
        </label>

        {brands.map((brand) => (
          <label key={brand.id} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-slate-700">
            <input
              type="radio"
              name="brand"
              checked={String(brandId) === String(brand.id)}
              onChange={() => onBrandChange(String(brand.id))}
              className="h-4 w-4 accent-blue-600"
            />
            {brand.ten_thuong_hieu}
          </label>
        ))}
      </div>
    </aside>
  );
}
