// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Column = { label: string; render: (r: Row) => React.ReactNode };
export type Resource = { key: string; title: string; columns: Column[] };

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const money = (v: unknown) =>
  v == null || v === "" ? "—" : new Intl.NumberFormat("vi-VN").format(Number(v)) + " ₫";
const date = (v: unknown) => (v ? new Date(String(v)).toLocaleString("vi-VN") : "—");

const Badge = ({ text, tone }: { text: string; tone: "ok" | "off" | "warn" }) => {
  const c = { ok: "bg-emerald-100 text-emerald-800", off: "bg-stone-200 text-stone-600", warn: "bg-amber-100 text-amber-800" }[tone];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${c}`}>{text}</span>;
};
const active = (r: Row) => <Badge text={r.status ? "Hiển thị" : "Ẩn"} tone={r.status ? "ok" : "off"} />;
const txt = (k: string) => (r: Row) => r[k] ?? "—";
const id: Column = { label: "ID", render: txt("id") };

const TRANG_THAI: Record<string, [string, "ok" | "off" | "warn"]> = {
  cho_xac_nhan: ["Chờ xác nhận", "warn"],
  da_huy: ["Đã huỷ", "off"],
};

export const RESOURCES: Resource[] = [
  { key: "danh-muc", title: "Danh mục", columns: [
    id,
    { label: "Tên danh mục", render: txt("ten_danh_muc") },
    { label: "Slug", render: txt("slug") },
    { label: "Danh mục cha", render: (r) => r.parent_id ?? "—" },
    { label: "Trạng thái", render: active },
  ]},
  { key: "thuong-hieu", title: "Thương hiệu", columns: [
    id,
    { label: "Logo", render: (r) => r.logo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.logo_url} alt="" className="h-8 w-8 rounded object-contain" /> : "—" },
    { label: "Tên thương hiệu", render: txt("ten_thuong_hieu") },
    { label: "Slug", render: txt("slug") },
    { label: "Trạng thái", render: active },
  ]},
  { key: "san-pham", title: "Sản phẩm", columns: [
    id,
    { label: "Ảnh", render: (r) => r.hinh_anh_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.hinh_anh_url} alt="" className="h-10 w-10 rounded object-cover" /> : "—" },
    { label: "Tên sản phẩm", render: txt("ten_san_pham") },
    { label: "Danh mục", render: (r) => r.danh_muc?.ten_danh_muc ?? r.danh_muc_id },
    { label: "Thương hiệu", render: (r) => r.thuong_hieu?.name ?? r.thuong_hieu_id },
    { label: "Giá", render: (r) => money(r.gia) },
    { label: "Giá KM", render: (r) => money(r.gia_khuyen_mai) },
    { label: "Tồn kho", render: (r) => <span className={r.so_luong === 0 ? "font-semibold text-red-600" : ""}>{r.so_luong}</span> },
    { label: "Lượt xem", render: txt("luot_xem") },
    { label: "Trạng thái", render: active },
  ]},
  { key: "don-hang", title: "Đơn hàng", columns: [
    { label: "Mã đơn", render: txt("ma_don_hang") },
    { label: "Khách nhận", render: (r) => `${r.ho_ten} · ${r.so_dien_thoai}` },
    { label: "Địa chỉ giao", render: txt("dia_chi_giao_hang") },
    { label: "Sản phẩm", render: (r) => (r.chi_tiets ?? []).map((c: Row) => `${c.ten_san_pham ?? c.san_pham?.ten_san_pham} ×${c.so_luong}`).join(", ") || "—" },
    { label: "Tổng tiền", render: (r) => money(r.tong_tien) },
    { label: "Thanh toán", render: txt("phuong_thuc_thanh_toan") },
    { label: "Tài khoản", render: (r) => r.nguoi_dung_id ?? "Khách" },
    { label: "Trạng thái", render: (r) => { const [t, tone] = TRANG_THAI[r.trang_thai] ?? [r.trang_thai, "ok"]; return <Badge text={t} tone={tone} />; } },
    { label: "Ngày đặt", render: (r) => date(r.created_at) },
  ]},
  { key: "gio-hang", title: "Giỏ hàng", columns: [
    id,
    { label: "Chủ giỏ", render: (r) => r.nguoi_dung_id ? `Người dùng #${r.nguoi_dung_id}` : `Khách (${r.session_id})` },
    { label: "Sản phẩm", render: (r) => (r.chi_tiets ?? []).map((c: Row) => `${c.san_pham?.ten_san_pham} ×${c.so_luong}`).join(", ") || "Giỏ trống" },
    { label: "Số lượng", render: (r) => r.tong_so_luong ?? 0 },
    { label: "Tạm tính", render: (r) => money(r.tong_tien) },
  ]},
  { key: "nguoi-dung", title: "Người dùng", columns: [
    id,
    { label: "Username", render: txt("username") },
    { label: "Họ tên", render: txt("ho_ten") },
    { label: "Email", render: txt("email") },
    { label: "SĐT", render: txt("so_dien_thoai") },
    { label: "Địa chỉ", render: txt("dia_chi") },
    { label: "Vai trò", render: (r) => <Badge text={r.vai_tro} tone={r.vai_tro === "admin" ? "warn" : "off"} /> },
    { label: "Trạng thái", render: (r) => <Badge text={r.status ? "Hoạt động" : "Bị khoá"} tone={r.status ? "ok" : "off"} /> },
  ]},
];

export async function fetchList(key: string): Promise<Row[]> {
  const res = await fetch(`${API}/admin/${key}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}
