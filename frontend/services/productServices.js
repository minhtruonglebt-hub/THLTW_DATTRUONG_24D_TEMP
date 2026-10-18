// =====================================================================
// FILE NÀY LÀ GÌ?
// Các hàm gọi API sản phẩm của Laravel (phần khách hàng xem, không cần đăng nhập).
//
//   getProducts()   : lấy DANH SÁCH sản phẩm  -> GET /api/san-pham
//   getProductBySlug(slug) : lấy 1 sản phẩm   -> GET /api/san-pham/{slug}
//
// Laravel trả về dạng:
//   { data: [ {sản phẩm}, {sản phẩm}... ], meta: { current_page, last_page, total... } }
// =====================================================================

import { API, callApi } from "@/lib/api";

// params là object các điều kiện lọc, ví dụ:
//   { per_page: 12, page: 2, danh_muc_id: 3, thuong_hieu_id: 1, keyword: "áo" }
// Trả về { products: [...], meta: {...} }
export async function getProducts(params = {}) {
  // Biến object thành chuỗi trên đường link: ?per_page=12&page=2 ...
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    // Bỏ qua ô nào để trống
    if (value !== "" && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });

  const json = await callApi(`${API}/san-pham?${query.toString()}`, { cache: "no-store" });
  return { products: json.data ?? [], meta: json.meta ?? {} };
}

// Lấy chi tiết 1 sản phẩm theo slug (dùng cho trang chi tiết)
export async function getProductBySlug(slug) {
  const json = await callApi(`${API}/san-pham/${slug}`, { cache: "no-store" });
  return json.data ?? json;
}

// Lấy sản phẩm cùng danh mục bằng ID hoặc slug sản phẩm hiện tại.
export async function getRelatedProducts(identifier, limit = 4) {
  const query = new URLSearchParams({ limit: String(limit) });
  const encodedIdentifier = encodeURIComponent(identifier);
  const json = await callApi(
    `${API}/san-pham/${encodedIdentifier}/lien-quan?${query.toString()}`,
    { cache: "no-store" },
  );

  return json.data ?? [];
}
