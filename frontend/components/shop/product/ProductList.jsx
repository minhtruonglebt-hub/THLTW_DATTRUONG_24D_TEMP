// Lưới nhiều thẻ sản phẩm
//   gridClass: số cột của lưới (mặc định 2 cột trên điện thoại, 4 cột trên màn hình lớn)

import ProductCard from "./ProductCard";

export default function ProductList({ products, onAddToCart, gridClass = "grid-cols-2 lg:grid-cols-4" }) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-slate-500">Chưa có sản phẩm nào.</p>;
  }

  return (
    <div className={`grid gap-5 ${gridClass}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
