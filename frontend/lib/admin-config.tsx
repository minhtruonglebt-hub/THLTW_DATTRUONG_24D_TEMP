import Badge from "@/components/Badge";
import Thumb from "@/components/Thumb";
import { date, money } from "@/lib/format";
import type { Row } from "@/lib/api";

export type Column = {
  label: string;
  render: (row: Row) => React.ReactNode;
};

export type Resource = {
  key: string;
  title: string;
  columns: Column[];
};

export const ORDER_STATUS: Record<string, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  da_xac_nhan: "Đã xác nhận",
  dang_giao: "Đang giao",
  hoan_tat: "Hoàn tất",
  da_huy: "Đã huỷ",
};

const text = (field: string) => (row: Row) => row[field] ?? "—";

function statusBadge(row: Row) {
  return <Badge text={row.status ? "Hiển thị" : "Ẩn"} tone={row.status ? "ok" : "off"} />;
}

function orderStatus(row: Row) {
  const labels: Record<string, string> = {
    cho_xac_nhan: "Chờ xác nhận",
    da_huy: "Đã huỷ",
  };
  const status = row.trang_thai ?? "—";
  const tone = status === "cho_xac_nhan" ? "warn" : status === "da_huy" ? "off" : "ok";

  return <Badge text={labels[status] ?? status} tone={tone} />;
}

function contactStatus(row: Row) {
  const handled = row.trang_thai === "da_xu_ly";
  return <Badge text={handled ? "Đã xử lý" : "Chưa xử lý"} tone={handled ? "ok" : "warn"} />;
}

export const RESOURCES: Resource[] = [
  {
    key: "danh-muc",
    title: "Danh mục",
    columns: [
      { label: "ID", render: text("id") },
      { label: "Tên danh mục", render: text("ten_danh_muc") },
      { label: "Slug", render: text("slug") },
      { label: "Danh mục cha", render: text("parent_id") },
      { label: "Trạng thái", render: statusBadge },
    ],
  },
  {
    key: "thuong-hieu",
    title: "Thương hiệu",
    columns: [
      { label: "ID", render: text("id") },
      { label: "Logo", render: (row) => <Thumb src={row.logo_url} className="h-8 w-8 object-contain" /> },
      { label: "Tên thương hiệu", render: text("ten_thuong_hieu") },
      { label: "Slug", render: text("slug") },
      { label: "Trạng thái", render: statusBadge },
    ],
  },
  {
    key: "san-pham",
    title: "Sản phẩm",
    columns: [
      { label: "ID", render: text("id") },
      { label: "Ảnh", render: (row) => <Thumb src={row.hinh_anh_url} className="h-10 w-10 object-cover" /> },
      { label: "Tên sản phẩm", render: text("ten_san_pham") },
      { label: "Danh mục", render: (row) => row.danh_muc?.ten_danh_muc ?? row.danh_muc_id ?? "—" },
      { label: "Thương hiệu", render: (row) => row.thuong_hieu?.name ?? row.thuong_hieu_id ?? "—" },
      { label: "Giá", render: (row) => money(row.gia) },
      { label: "Giá KM", render: (row) => money(row.gia_khuyen_mai) },
      {
        label: "Tồn kho",
        render: (row) => (
          <span className={row.so_luong === 0 ? "font-semibold text-red-600" : ""}>
            {row.so_luong ?? "—"}
          </span>
        ),
      },
      { label: "Lượt xem", render: text("luot_xem") },
      { label: "Trạng thái", render: statusBadge },
    ],
  },
  {
    key: "don-hang",
    title: "Đơn hàng",
    columns: [
      { label: "Mã đơn", render: text("ma_don_hang") },
      { label: "Khách nhận", render: (row) => `${row.ho_ten ?? "—"} · ${row.so_dien_thoai ?? "—"}` },
      { label: "Địa chỉ giao", render: text("dia_chi_giao_hang") },
      {
        label: "Sản phẩm",
        render: (row) =>
          (row.chi_tiets ?? [])
            .map((item: Row) => `${item.ten_san_pham ?? item.san_pham?.ten_san_pham ?? "Sản phẩm"} ×${item.so_luong}`)
            .join(", ") || "—",
      },
      { label: "Tổng tiền", render: (row) => money(row.tong_tien) },
      {
        label: "Thanh toán",
        render: (row) => {
          const method = { cod: "COD", momo: "MoMo", momo_qr: "QR ngân hàng" }[row.phuong_thuc_thanh_toan as string] ?? row.phuong_thuc_thanh_toan ?? "—";
          const paid = row.trang_thai_thanh_toan === "da_thanh_toan";
          const waiting = row.trang_thai_thanh_toan === "cho_shop_xac_nhan";
          return (
            <span>
              {method}
              {row.phuong_thuc_thanh_toan !== "cod" && (
                <span className={paid ? " font-semibold text-emerald-700" : waiting ? " font-semibold text-blue-700" : " text-amber-700"}>
                  {paid ? " · Đã trả" : waiting ? " · Khách báo đã chuyển" : " · Chưa trả"}
                </span>
              )}
            </span>
          );
        },
      },
      { label: "Tài khoản", render: (row) => row.nguoi_dung_id ?? "Khách" },
      { label: "Trạng thái", render: orderStatus },
      { label: "Ngày đặt", render: (row) => date(row.created_at) },
    ],
  },
  {
    key: "lien-he",
    title: "Tiếp nhận liên hệ",
    columns: [
      { label: "Người gửi", render: text("ho_ten") },
      { label: "Email", render: text("email") },
      { label: "Tiêu đề", render: text("tieu_de") },
      {
        label: "Nội dung",
        render: (row) => (
          <span className="block max-w-xs truncate" title={row.noi_dung ?? ""}>
            {row.noi_dung ?? "—"}
          </span>
        ),
      },
      { label: "Trạng thái", render: contactStatus },
      { label: "Ngày gửi", render: (row) => date(row.created_at) },
    ],
  },
  {
    key: "gio-hang",
    title: "Giỏ hàng",
    columns: [
      { label: "ID", render: text("id") },
      {
        label: "Chủ giỏ",
        render: (row) => (row.nguoi_dung_id ? `Người dùng #${row.nguoi_dung_id}` : `Khách (${row.session_id ?? "—"})`),
      },
      {
        label: "Sản phẩm",
        render: (row) =>
          (row.chi_tiets ?? [])
            .map((item: Row) => `${item.san_pham?.ten_san_pham ?? "Sản phẩm"} ×${item.so_luong}`)
            .join(", ") || "Giỏ trống",
      },
      { label: "Số lượng", render: (row) => row.tong_so_luong ?? 0 },
      { label: "Tạm tính", render: (row) => money(row.tong_tien) },
    ],
  },
  {
    key: "nguoi-dung",
    title: "Người dùng",
    columns: [
      { label: "ID", render: text("id") },
      { label: "Username", render: text("username") },
      { label: "Họ tên", render: text("ho_ten") },
      { label: "Email", render: text("email") },
      { label: "SĐT", render: text("so_dien_thoai") },
      { label: "Địa chỉ", render: text("dia_chi") },
      {
        label: "Vai trò",
        render: (row) => <Badge text={row.vai_tro ?? "—"} tone={row.vai_tro === "admin" ? "warn" : "off"} />,
      },
      {
        label: "Trạng thái",
        render: (row) => (
          <Badge text={row.status ? "Hoạt động" : "Bị khoá"} tone={row.status ? "ok" : "off"} />
        ),
      },
    ],
  },
];
