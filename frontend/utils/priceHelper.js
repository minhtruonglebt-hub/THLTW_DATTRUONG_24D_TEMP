// =====================================================================
// FILE NÀY LÀ GÌ?
// Các hàm nhỏ để tính giá hiển thị của sản phẩm.
//   gia            : giá gốc
//   gia_khuyen_mai : giá khuyến mãi (có thể trống)
// =====================================================================

// Sản phẩm có đang giảm giá không? (có giá khuyến mãi VÀ rẻ hơn giá gốc)
export function isOnSale(product) {
  const salePrice = Number(product.gia_khuyen_mai);
  return salePrice > 0 && salePrice < Number(product.gia);
}

// Giá khách phải trả: đang giảm thì lấy giá khuyến mãi, không thì lấy giá gốc
export function getPrice(product) {
  return isOnSale(product) ? Number(product.gia_khuyen_mai) : Number(product.gia);
}

// Phần trăm giảm, ví dụ 20 (nghĩa là giảm 20%)
export function getDiscountPercent(product) {
  if (!isOnSale(product)) return 0;
  return Math.round((1 - Number(product.gia_khuyen_mai) / Number(product.gia)) * 100);
}
