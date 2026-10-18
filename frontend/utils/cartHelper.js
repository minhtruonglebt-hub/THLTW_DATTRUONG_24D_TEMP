// =====================================================================
// FILE NÀY LÀ GÌ?
// Giỏ hàng tạm lưu trong localStorage của trình duyệt (chưa cần đăng nhập).
// Mỗi món trong giỏ: { id, ten_san_pham, slug, hinh_anh_url, price, quantity }
//
// Sau mỗi lần thay đổi, mình "báo tin" cho Header biết để cập nhật số trên biểu tượng giỏ.
// =====================================================================

import { getPrice } from "./priceHelper";

const CART_KEY = "cart";

// Đọc giỏ hàng hiện tại (không có thì trả về mảng rỗng)
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

// Lưu giỏ hàng và báo cho Header
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

// Thêm 1 sản phẩm vào giỏ (đã có rồi thì tăng số lượng)
export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const exist = cart.find((item) => item.id === product.id);

  if (exist) {
    exist.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      ten_san_pham: product.ten_san_pham,
      slug: product.slug,
      hinh_anh_url: product.hinh_anh_url,
      price: getPrice(product),
      quantity,
    });
  }

  saveCart(cart);
}

// Tổng số món trong giỏ (hiện trên Header)
export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
