// =====================================================================
// FILE NÀY LÀ GÌ?
// Giỏ hàng tạm lưu trong localStorage của trình duyệt (chưa cần đăng nhập).
// Mỗi món trong giỏ: { id, ten_san_pham, slug, hinh_anh_url, price, quantity }
//
// Sau mỗi lần thay đổi, mình "báo tin" cho Header biết để cập nhật số trên biểu tượng giỏ.
// =====================================================================

import { getPrice } from "./priceHelper";
import { API, callApi } from "@/lib/api";

const CART_KEY = "cart";
const CART_SESSION_KEY = "cart_session_id";

export function getCartSessionId() {
  let sessionId = localStorage.getItem(CART_SESSION_KEY);
  if (!sessionId) {
    sessionId = globalThis.crypto?.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }
  return sessionId;
}

async function requestServerCart(method, data = {}) {
  const sessionId = getCartSessionId();
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  };
  if (method !== "GET") {
    options.body = JSON.stringify({ ...data, session_id: sessionId });
  }
  return callApi(`${API}/gio-hang`, options);
}

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
export async function addToCart(product, quantity = 1) {
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

  try {
    await requestServerCart("POST", { san_pham_id: product.id, so_luong: safeQuantity });
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : "Không thể cập nhật giỏ hàng." };
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
export async function updateCartQuantity(productId, quantity) {
  const safeQuantity = Math.floor(Number(quantity));
  if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return { ok: false, message: "Số lượng tối thiểu là 1" };

  const current = getCart().find((item) => item.id === productId);
  const stock = Number(current?.stock);
  if (Number.isFinite(stock) && stock >= 1 && safeQuantity > stock) {
    return { ok: false, message: `Chỉ còn ${stock} sản phẩm trong kho` };
  }

  try {
    const serverCart = await requestServerCart("GET");
    const detail = (serverCart.data?.chi_tiets ?? []).find(
      (item) => Number(item.san_pham_id) === Number(productId),
    );
    if (detail) {
      await callApi(`${API}/gio-hang/${detail.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": getCartSessionId(),
        },
        body: JSON.stringify({ so_luong: safeQuantity, session_id: getCartSessionId() }),
      });
    } else {
      await requestServerCart("POST", { san_pham_id: productId, so_luong: safeQuantity });
    }
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : "Không thể cập nhật giỏ hàng." };
  }

  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, quantity: safeQuantity } : item,
  );
  saveCart(cart);
  return { ok: true, message: "" };
}

export async function removeFromCart(productId) {
  try {
    const serverCart = await requestServerCart("GET");
    const detail = (serverCart.data?.chi_tiets ?? []).find(
      (item) => Number(item.san_pham_id) === Number(productId),
    );
    if (detail) {
      const sessionId = getCartSessionId();
      await callApi(`${API}/gio-hang/${detail.id}`, {
        method: "DELETE",
        headers: { "X-Session-Id": sessionId },
      });
    }
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : "Không thể xóa sản phẩm khỏi giỏ." };
  }

  saveCart(getCart().filter((item) => item.id !== productId));
  return { ok: true, message: "" };
}

export async function clearCart() {
  try {
    await requestServerCart("DELETE");
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : "Không thể xóa giỏ hàng." };
  }

  clearLocalCart();
  return { ok: true, message: "" };
}

export function clearLocalCart() {
  saveCart([]);
}

// Tổng số món trong giỏ (hiện trên Header)
export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
