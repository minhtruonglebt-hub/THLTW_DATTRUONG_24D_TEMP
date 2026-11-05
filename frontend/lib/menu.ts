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
  { key: "lien-he", path: "contacts", title: "Liên hệ" },
  { key: "bai-viet", path: "posts", title: "Bài viết" },
  { key: "chu-de-bai-viet", path: "topics", title: "Chủ đề bài viết" },
  { key: "trang-don", path: "pages", title: "Trang tĩnh" },
  { key: "muc-menu", path: "menus", title: "Menu" },
  { key: "banner", path: "banners", title: "Banner" },
  { key: "khuyen-mai", path: "promotions", title: "Khuyến mãi" },
  { key: "phieu-kho", path: "inventory", title: "Quản lý kho" },
  { key: "gio-hang", path: "carts", title: "Giỏ hàng" },
  { key: "nguoi-dung", path: "users", title: "Người dùng" },
  { key: "cau-hinh-website", path: "settings", title: "Cấu hình website", showCount: false },
];
