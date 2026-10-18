// =====================================================================
// FILE NÀY LÀ GÌ?
// Danh sách các mục quản lý. Dùng cho:
//   - Menu bên trái (AdminSidebar)
//   - Các ô đếm số lượng ở trang Tổng quan
//
//   key  : tên đường dẫn API Laravel (vd: /api/admin/danh-muc)
//   path : tên thư mục trong app/admin/ (vd: /admin/categories)
// =====================================================================

export const MENU = [
  { key: "danh-muc", path: "categories", title: "Danh mục" },
  { key: "thuong-hieu", path: "brands", title: "Thương hiệu" },
  { key: "san-pham", path: "products", title: "Sản phẩm" },
  { key: "don-hang", path: "orders", title: "Đơn hàng" },
  { key: "gio-hang", path: "carts", title: "Giỏ hàng" },
  { key: "nguoi-dung", path: "users", title: "Người dùng" },
];
