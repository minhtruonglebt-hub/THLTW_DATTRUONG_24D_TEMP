export type Field = {
  name: string; label: string; required?: boolean;
  type: "text" | "number" | "textarea" | "select" | "file" | "switch";
  source?: "danh-muc" | "thuong-hieu"; // nguồn dữ liệu cho ô chọn
};
export type FormCfg = { path: string; fields: Field[] };

// Chỉ 3 mục này có API thêm/sửa/xoá sẵn bên Laravel
export const FORMS: Record<string, FormCfg> = {
  "danh-muc": { path: "danh-muc", fields: [
    { name: "ten_danh_muc", label: "Tên danh mục", type: "text", required: true },
    { name: "parent_id", label: "Danh mục cha (để trống nếu là mục gốc)", type: "select", source: "danh-muc" },
    { name: "mo_ta", label: "Mô tả", type: "textarea" },
    { name: "status", label: "Hiển thị", type: "switch" },
  ]},
  "thuong-hieu": { path: "thuong-hieu", fields: [
    { name: "ten_thuong_hieu", label: "Tên thương hiệu", type: "text", required: true },
    { name: "logo", label: "Logo (ảnh ≤ 2MB)", type: "file" },
    { name: "mo_ta", label: "Mô tả", type: "textarea" },
    { name: "status", label: "Hiển thị", type: "switch" },
  ]},
  "san-pham": { path: "san-pham", fields: [
    { name: "ten_san_pham", label: "Tên sản phẩm", type: "text", required: true },
    { name: "danh_muc_id", label: "Danh mục", type: "select", source: "danh-muc", required: true },
    { name: "thuong_hieu_id", label: "Thương hiệu", type: "select", source: "thuong-hieu", required: true },
    { name: "gia", label: "Giá (₫)", type: "number", required: true },
    { name: "gia_khuyen_mai", label: "Giá khuyến mãi (₫)", type: "number" },
    { name: "so_luong", label: "Tồn kho", type: "number" },
    { name: "hinh_anh", label: "Ảnh đại diện (≤ 2MB)", type: "file" },
    { name: "mo_ta_ngan", label: "Mô tả ngắn", type: "textarea" },
    { name: "mo_ta", label: "Mô tả chi tiết", type: "textarea" },
    { name: "status", label: "Hiển thị", type: "switch" },
  ]},
};
