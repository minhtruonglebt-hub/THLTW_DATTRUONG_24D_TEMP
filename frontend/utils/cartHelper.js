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
// Trả về { ok, message }:
//  - Hết hàng (so_luong < 1)  -> ok = false, message = "HẾT HÀNG"
//  - Vượt quá tồn kho         -> ok = false, báo số lượng còn lại
export function addToCart(product, quantity = 1) {
  const stock = Math.floor(Number(product.so_luong));

  // Số lượng trong kho dưới 1 => báo HẾT HÀNG, không cho thêm
  if (!Number.isFinite(stock) || stock < 1) {
    return { ok: false, message: "HẾT HÀNG" };
  }

  const cart = getCart();
  const exist = cart.find((item) => item.id === product.id);
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1)); // không bao giờ < 1
  const currentQuantity = exist ? Math.max(1, Number(exist.quantity) || 1) : 0;

  if (currentQuantity + safeQuantity > stock) {
    return { ok: false, message: `Chỉ còn ${stock} sản phẩm trong kho (trong giỏ đã có ${currentQuantity})` };
  }

  if (exist) {
    exist.quantity = currentQuantity + safeQuantity;
    exist.stock = stock;
  } else {
    cart.push({
      id: product.id,
      ten_san_pham: product.ten_san_pham,
      slug: product.slug,
      hinh_anh_url: product.hinh_anh_url,
      price: getPrice(product),
      quantity: safeQuantity,
      stock, // lưu tồn kho để giỏ hàng chặn số lượng vượt kho
    });
  }

  saveCart(cart);
  return { ok: true, message: "Đã thêm vào giỏ hàng" };
}

// Đổi số lượng 1 món trong giỏ: không cho < 1 và không cho vượt tồn kho
export function updateCartQuantity(productId, quantity) {
  const safeQuantity = Math.floor(Number(quantity));
  if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return { ok: false, message: "Số lượng tối thiểu là 1" };

  const current = getCart().find((item) => item.id === productId);
  const stock = Number(current?.stock);
  if (Number.isFinite(stock) && stock >= 1 && safeQuantity > stock) {
    return { ok: false, message: `Chỉ còn ${stock} sản phẩm trong kho` };
  }

  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, quantity: safeQuantity } : item,
  );
  saveCart(cart);
  return { ok: true, message: "" };
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
}

export function clearCart() {
  saveCart([]);
}

// Tổng số món trong giỏ (hiện trên Header)
export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
