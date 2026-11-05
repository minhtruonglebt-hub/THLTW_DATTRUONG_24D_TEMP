-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 01, 2026 lúc 06:12 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ecommerce_thltw`
--
CREATE DATABASE IF NOT EXISTS `ecommerce_thltw` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ecommerce_thltw`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bai_viet`
--

CREATE TABLE `bai_viet` (
  `id` int(11) NOT NULL,
  `chu_de_id` int(11) NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `tom_tat` text DEFAULT NULL,
  `noi_dung` longtext DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bai_viet`
--

INSERT INTO `bai_viet` (`id`, `chu_de_id`, `tieu_de`, `slug`, `hinh_anh`, `tom_tat`, `noi_dung`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cach chon dien thoai phu hop nhu cau', 'cach-chon-dien-thoai-phu-hop', 'uploads/posts/chon-dien-thoai.jpg', 'Mot so tieu chi co ban khi chon mua dien thoai.', 'Hay xac dinh nhu cau su dung, ngan sach, dung luong luu tru va cac tinh nang can thiet truoc khi mua.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 2, 'Kinh nghiem mua laptop hoc tap', 'kinh-nghiem-mua-laptop-hoc-tap', 'uploads/posts/mua-laptop.jpg', 'Goi y chon laptop phuc vu hoc tap va lam viec.', 'Nen xem xet CPU, RAM, dung luong SSD, thoi luong pin va chinh sach bao hanh.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 3, 'Chuong trinh uu dai phu kien', 'chuong-trinh-uu-dai-phu-kien', 'uploads/posts/uu-dai-phu-kien.jpg', 'Cap nhat uu dai danh cho mot so phu kien cong nghe.', 'Khach hang co the tham khao cac ma giam gia dang duoc ap dung tren website.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 3, 'Chào mừng bạn đến với cửa hàng', 'chao-mung-ban-den-voi-cua-hang', NULL, 'Lời chào đầu tiên từ cửa hàng.', 'Cảm ơn bạn đã ghé thăm cửa hàng của chúng tôi.\n\nChúng tôi sẽ thường xuyên cập nhật sản phẩm mới và các bài viết hữu ích tại đây. Nếu cần hỗ trợ, bạn có thể gửi tin nhắn ở trang Liên hệ.', 1, '2026-10-31 19:41:55', '2026-10-31 19:41:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banner`
--

CREATE TABLE `banner` (
  `id` int(11) NOT NULL,
  `tieu_de` varchar(255) DEFAULT NULL,
  `hinh_anh` varchar(255) NOT NULL,
  `lien_ket` varchar(500) DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `banner`
--

INSERT INTO `banner` (`id`, `tieu_de`, `hinh_anh`, `lien_ket`, `thu_tu`, `status`, `created_at`) VALUES
(1, 'Uu dai dien thoai', 'uploads/banners/banner-dien-thoai.jpg', '/danh-muc/dien-thoai', 1, 1, '2026-10-30 17:36:27'),
(2, 'Laptop cho hoc tap', 'uploads/banners/banner-laptop.jpg', '/danh-muc/laptop', 2, 1, '2026-10-30 17:36:27'),
(3, 'Phu kien gia tot', 'uploads/banners/banner-phu-kien.jpg', '/danh-muc/phu-kien', 3, 1, '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cau_hinh_website`
--

CREATE TABLE `cau_hinh_website` (
  `id` int(11) NOT NULL,
  `ten_website` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `favicon` varchar(255) DEFAULT NULL,
  `hotline` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cau_hinh_website`
--

INSERT INTO `cau_hinh_website` (`id`, `ten_website`, `logo`, `favicon`, `hotline`, `email`, `dia_chi`, `facebook`, `instagram`, `youtube`, `seo_title`, `seo_description`, `created_at`, `updated_at`) VALUES
(1, 'Ecommerce THLTW', 'uploads/logo.png', 'uploads/favicon.ico', '19001234', 'support@example.com', 'TP. Ho Chi Minh, Viet Nam', 'https://facebook.com/', 'https://instagram.com/', 'https://youtube.com/', 'Ecommerce THLTW - Cua hang cong nghe', 'Website gioi thieu va kinh doanh cac san pham cong nghe.', '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_don_hang`
--

CREATE TABLE `chi_tiet_don_hang` (
  `id` int(11) NOT NULL,
  `don_hang_id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `ten_san_pham` varchar(255) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `don_gia` decimal(15,2) NOT NULL,
  `thanh_tien` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_don_hang`
--

INSERT INTO `chi_tiet_don_hang` (`id`, `don_hang_id`, `san_pham_id`, `ten_san_pham`, `so_luong`, `don_gia`, `thanh_tien`) VALUES
(1, 1, 1, 'iPhone 15 128GB', 1, 18490000.00, 18490000.00),
(2, 2, 2, 'Samsung Galaxy S24 256GB', 1, 17990000.00, 17990000.00),
(3, 3, 4, 'Tai nghe Logitech H390', 1, 790000.00, 790000.00),
(4, 3, 5, 'Sac nhanh Anker 20W', 1, 390000.00, 390000.00),
(5, 4, 4, 'Tai nghe Logitech H390', 1, 790000.00, 790000.00),
(6, 5, 5, 'Sac nhanh Anker 20W', 1, 390000.00, 390000.00),
(7, 6, 1, 'iPhone 15 128GB', 1, 18490000.00, 18490000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_gio_hang`
--

CREATE TABLE `chi_tiet_gio_hang` (
  `id` int(11) NOT NULL,
  `gio_hang_id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_gio_hang`
--

INSERT INTO `chi_tiet_gio_hang` (`id`, `gio_hang_id`, `san_pham_id`, `so_luong`) VALUES
(1, 1, 4, 1),
(2, 1, 5, 2),
(3, 2, 2, 1),
(4, 3, 6, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_phieu_kho`
--

CREATE TABLE `chi_tiet_phieu_kho` (
  `id` int(11) NOT NULL,
  `phieu_kho_id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `don_gia` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_phieu_kho`
--

INSERT INTO `chi_tiet_phieu_kho` (`id`, `phieu_kho_id`, `san_pham_id`, `so_luong`, `don_gia`) VALUES
(1, 1, 1, 10, 17000000.00),
(2, 1, 5, 30, 300000.00),
(3, 1, 4, 20, 650000.00),
(4, 2, 1, 1, 17000000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chu_de_bai_viet`
--

CREATE TABLE `chu_de_bai_viet` (
  `id` int(11) NOT NULL,
  `ten_chu_de` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chu_de_bai_viet`
--

INSERT INTO `chu_de_bai_viet` (`id`, `ten_chu_de`, `slug`, `status`) VALUES
(1, 'Tin tuc cong nghe', 'tin-tuc-cong-nghe', 1),
(2, 'Huong dan mua sam', 'huong-dan-mua-sam', 1),
(3, 'Khuyen mai', 'khuyen-mai', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_muc`
--

CREATE TABLE `danh_muc` (
  `id` int(11) NOT NULL,
  `ten_danh_muc` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danh_muc`
--

INSERT INTO `danh_muc` (`id`, `ten_danh_muc`, `slug`, `mo_ta`, `parent_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Dien thoai', 'dien-thoai', 'Dien thoai thong minh va phu kien', NULL, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'Laptop', 'laptop', 'Laptop hoc tap va lam viec', NULL, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'Phu kien', 'phu-kien', 'Phu kien cong nghe', NULL, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 'Tai nghe', 'tai-nghe', 'Tai nghe co day va khong day', 3, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(5, 'Sac va cap', 'sac-va-cap', 'Bo sac va cap sac', 3, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dat_lai_mat_khau`
--

CREATE TABLE `dat_lai_mat_khau` (
  `id` int(11) NOT NULL,
  `nguoi_dung_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `thoi_han` datetime NOT NULL,
  `da_su_dung` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `dat_lai_mat_khau`
--

INSERT INTO `dat_lai_mat_khau` (`id`, `nguoi_dung_id`, `token`, `thoi_han`, `da_su_dung`, `created_at`) VALUES
(1, 2, 'demo-reset-token-001', '2027-01-01 00:00:00', 0, '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `don_hang`
--

CREATE TABLE `don_hang` (
  `id` int(11) NOT NULL,
  `ma_don_hang` varchar(50) NOT NULL,
  `nguoi_dung_id` int(11) DEFAULT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) NOT NULL,
  `dia_chi_giao_hang` varchar(500) NOT NULL,
  `tong_tien` decimal(15,2) NOT NULL DEFAULT 0.00,
  `phuong_thuc_thanh_toan` varchar(50) DEFAULT NULL,
  `trang_thai` enum('cho_xac_nhan','da_xac_nhan','dang_giao','hoan_tat','da_huy') DEFAULT 'cho_xac_nhan',
  `trang_thai_thanh_toan` varchar(50) NOT NULL DEFAULT 'cho_thanh_toan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `momo_order_id` varchar(100) DEFAULT NULL,
  `momo_trans_id` varchar(100) DEFAULT NULL,
  `momo_pay_url` text DEFAULT NULL,
  `momo_qr_code` mediumtext DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `don_hang`
--

INSERT INTO `don_hang` (`id`, `ma_don_hang`, `nguoi_dung_id`, `ho_ten`, `so_dien_thoai`, `dia_chi_giao_hang`, `tong_tien`, `phuong_thuc_thanh_toan`, `trang_thai`, `trang_thai_thanh_toan`, `created_at`, `updated_at`, `momo_order_id`, `momo_trans_id`, `momo_pay_url`, `momo_qr_code`, `paid_at`) VALUES
(1, 'DH2026100001', 2, 'Nguyen Van An', '0900000002', 'Quan 1, TP. Ho Chi Minh', 18490000.00, 'COD', 'hoan_tat', 'cho_thanh_toan', '2026-10-30 17:36:27', '2026-10-30 17:36:27', NULL, NULL, NULL, NULL, NULL),
(2, 'DH2026100002', 3, 'Tran Thi Binh', '0900000003', 'Thu Duc, TP. Ho Chi Minh', 17990000.00, 'Chuyen khoan', 'dang_giao', 'cho_thanh_toan', '2026-10-30 17:36:27', '2026-10-30 17:36:27', NULL, NULL, NULL, NULL, NULL),
(3, 'DH2026100003', 4, 'Le Minh Khang', '0900000004', 'Bien Hoa, Dong Nai', 1180000.00, 'COD', 'cho_xac_nhan', 'cho_thanh_toan', '2026-10-30 17:36:27', '2026-10-30 17:36:27', NULL, NULL, NULL, NULL, NULL),
(4, 'DH20261030174611CMOD', NULL, 'trandat11123', '0398586487', 'dsdsdsd', 790000.00, 'momo_qr', 'cho_xac_nhan', 'cho_shop_xac_nhan', '2026-10-30 10:46:11', '2026-10-30 10:46:19', NULL, NULL, NULL, NULL, NULL),
(5, 'DH20261031191408K6DP', NULL, 'trandat11123', '0398586487', 'dsdsdsd', 390000.00, 'momo_qr', 'da_huy', 'cho_thanh_toan', '2026-10-31 12:14:08', '2026-10-31 12:14:24', NULL, NULL, NULL, NULL, NULL),
(6, 'DH20261101141205DE60', 2, 'Nguyen Van An', '0900000002', 'Quan 1, TP. Ho Chi Minh', 18490000.00, 'cod', 'cho_xac_nhan', 'chua_thanh_toan', '2026-11-01 07:12:05', '2026-11-01 07:12:05', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gio_hang`
--

CREATE TABLE `gio_hang` (
  `id` int(11) NOT NULL,
  `nguoi_dung_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `gio_hang`
--

INSERT INTO `gio_hang` (`id`, `nguoi_dung_id`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 3, NULL, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, NULL, 'guest-session-demo-001', '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hinh_anh_san_pham`
--

CREATE TABLE `hinh_anh_san_pham` (
  `id` int(11) NOT NULL,
  `san_pham_id` int(11) NOT NULL,
  `hinh_anh` varchar(255) NOT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hinh_anh_san_pham`
--

INSERT INTO `hinh_anh_san_pham` (`id`, `san_pham_id`, `hinh_anh`, `thu_tu`, `status`) VALUES
(1, 1, 'uploads/products/iphone-15-1.jpg', 1, 1),
(2, 1, 'uploads/products/iphone-15-2.jpg', 2, 1),
(3, 2, 'uploads/products/galaxy-s24-1.jpg', 1, 1),
(4, 3, 'uploads/products/asus-vivobook-15-1.jpg', 1, 1),
(5, 4, 'uploads/products/logitech-h390-1.jpg', 1, 1),
(6, 5, 'uploads/products/anker-20w-1.jpg', 1, 1),
(7, 6, 'uploads/products/anker-usbc-1m-1.jpg', 1, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khuyen_mai`
--

CREATE TABLE `khuyen_mai` (
  `id` int(11) NOT NULL,
  `ma_khuyen_mai` varchar(50) NOT NULL,
  `ten_khuyen_mai` varchar(255) NOT NULL,
  `loai_giam` enum('phan_tram','so_tien') NOT NULL,
  `gia_tri_giam` decimal(15,2) NOT NULL,
  `don_toi_thieu` decimal(15,2) DEFAULT 0.00,
  `so_lan_su_dung` int(11) DEFAULT NULL,
  `da_su_dung` int(11) DEFAULT 0,
  `ngay_bat_dau` datetime NOT NULL,
  `ngay_ket_thuc` datetime NOT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khuyen_mai`
--

INSERT INTO `khuyen_mai` (`id`, `ma_khuyen_mai`, `ten_khuyen_mai`, `loai_giam`, `gia_tri_giam`, `don_toi_thieu`, `so_lan_su_dung`, `da_su_dung`, `ngay_bat_dau`, `ngay_ket_thuc`, `status`, `created_at`) VALUES
(1, 'WELCOME10', 'Giam 10 phan tram cho khach moi', 'phan_tram', 10.00, 500000.00, 100, 8, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, '2026-10-30 17:36:27'),
(2, 'GIAM500K', 'Giam 500 nghin dong', 'so_tien', 500000.00, 5000000.00, 50, 12, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, '2026-10-30 17:36:27'),
(3, 'PHUKIEN5', 'Giam 5 phan tram phu kien', 'phan_tram', 5.00, 200000.00, 200, 25, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lich_su_trang_thai_don_hang`
--

CREATE TABLE `lich_su_trang_thai_don_hang` (
  `id` int(11) NOT NULL,
  `don_hang_id` int(11) NOT NULL,
  `trang_thai_cu` varchar(50) DEFAULT NULL,
  `trang_thai_moi` varchar(50) NOT NULL,
  `ghi_chu` text DEFAULT NULL,
  `nguoi_thuc_hien_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lich_su_trang_thai_don_hang`
--

INSERT INTO `lich_su_trang_thai_don_hang` (`id`, `don_hang_id`, `trang_thai_cu`, `trang_thai_moi`, `ghi_chu`, `nguoi_thuc_hien_id`, `created_at`) VALUES
(1, 1, NULL, 'cho_xac_nhan', 'Khach hang tao don', 2, '2026-10-30 17:36:27'),
(2, 1, 'cho_xac_nhan', 'da_xac_nhan', 'Da kiem tra don hang', 1, '2026-10-30 17:36:27'),
(3, 1, 'da_xac_nhan', 'dang_giao', 'Don hang da ban giao don vi van chuyen', 1, '2026-10-30 17:36:27'),
(4, 1, 'dang_giao', 'hoan_tat', 'Giao hang thanh cong', 1, '2026-10-30 17:36:27'),
(5, 2, NULL, 'cho_xac_nhan', 'Khach hang tao don', 3, '2026-10-30 17:36:27'),
(6, 2, 'cho_xac_nhan', 'da_xac_nhan', 'Da xac nhan don hang', 1, '2026-10-30 17:36:27'),
(7, 2, 'da_xac_nhan', 'dang_giao', 'Dang van chuyen', 1, '2026-10-30 17:36:27'),
(8, 3, NULL, 'cho_xac_nhan', 'Don hang moi tao', 4, '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lien_he`
--

CREATE TABLE `lien_he` (
  `id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `tieu_de` varchar(255) DEFAULT NULL,
  `noi_dung` text DEFAULT NULL,
  `trang_thai` enum('chua_xu_ly','da_xu_ly') DEFAULT 'chua_xu_ly',
  `phan_hoi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lien_he`
--

INSERT INTO `lien_he` (`id`, `ho_ten`, `email`, `so_dien_thoai`, `tieu_de`, `noi_dung`, `trang_thai`, `phan_hoi`, `created_at`, `updated_at`) VALUES
(1, 'Pham Gia Huy', 'huy@example.com', '0900000011', 'Hoi ve san pham', 'Shop cho minh hoi them thong tin ve laptop.', 'chua_xu_ly', NULL, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'Do Ngoc Mai', 'mai@example.com', '0900000012', 'Thoi gian giao hang', 'Don hang cua minh du kien khi nao giao toi?', 'da_xu_ly', 'Shop da lien he va cung cap thoi gian giao hang.', '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'trandat', 'dat240620006@gmail.com', '0398586487', 'fef', 'fwfwfwffwfwfw', 'chua_xu_ly', NULL, '2026-11-01 07:11:27', '2026-11-01 07:11:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `ten_menu` varchar(255) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `menu`
--

INSERT INTO `menu` (`id`, `ten_menu`, `url`, `parent_id`, `thu_tu`, `status`) VALUES
(1, 'Trang chu', '/', NULL, 1, 1),
(2, 'San pham', '/san-pham', NULL, 2, 1),
(3, 'Tin tuc', '/tin-tuc', NULL, 3, 1),
(4, 'Lien he', '/lien-he', NULL, 4, 1),
(5, 'Dien thoai', '/danh-muc/dien-thoai', 2, 1, 1),
(6, 'Laptop', '/danh-muc/laptop', 2, 2, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `muc_menu`
--

CREATE TABLE `muc_menu` (
  `id` int(11) NOT NULL,
  `ten_menu` varchar(255) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `thu_tu` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `muc_menu`
--

INSERT INTO `muc_menu` (`id`, `ten_menu`, `url`, `parent_id`, `thu_tu`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Trang chu', '/', NULL, 1, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'Cua hang', '/san-pham', NULL, 2, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'Gioi thieu', '/gioi-thieu', NULL, 3, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 'Ho tro', '/lien-he', NULL, 4, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoi_dung`
--

CREATE TABLE `nguoi_dung` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `vai_tro` enum('member','admin') DEFAULT 'member',
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoi_dung`
--

INSERT INTO `nguoi_dung` (`id`, `username`, `password`, `ho_ten`, `email`, `so_dien_thoai`, `dia_chi`, `vai_tro`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quan tri vien', 'admin@example.com', '0900000001', 'TP. Ho Chi Minh', 'admin', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'khachhang01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyen Van An', 'an@example.com', '0900000002', 'Quan 1, TP. Ho Chi Minh', 'member', 1, '2026-10-30 17:36:27', '2026-10-31 12:23:01'),
(3, 'khachhang02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tran Thi Binh', 'binh@example.com', '0900000003', 'Thu Duc, TP. Ho Chi Minh', 'member', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 'khachhang03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Le Minh Khang', 'khang@example.com', '0900000004', 'Bien Hoa, Dong Nai', 'member', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--


-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieu_kho`
--

CREATE TABLE `phieu_kho` (
  `id` int(11) NOT NULL,
  `ma_phieu` varchar(50) NOT NULL,
  `loai_phieu` enum('nhap','xuat') NOT NULL,
  `ghi_chu` text DEFAULT NULL,
  `nguoi_tao_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `phieu_kho`
--

INSERT INTO `phieu_kho` (`id`, `ma_phieu`, `loai_phieu`, `ghi_chu`, `nguoi_tao_id`, `created_at`) VALUES
(1, 'PN20260001', 'nhap', 'Nhap them hang dien thoai va phu kien', 1, '2026-10-30 17:36:27'),
(2, 'PX20260001', 'xuat', 'Xuat hang de giao don DH2026100001', 1, '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `san_pham`
--

CREATE TABLE `san_pham` (
  `id` int(11) NOT NULL,
  `ten_san_pham` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `danh_muc_id` int(11) NOT NULL,
  `thuong_hieu_id` int(11) NOT NULL,
  `gia` decimal(15,2) NOT NULL,
  `gia_khuyen_mai` decimal(15,2) DEFAULT NULL,
  `so_luong` int(11) DEFAULT 0,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `mo_ta_ngan` text DEFAULT NULL,
  `mo_ta` text DEFAULT NULL,
  `luot_xem` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `san_pham`
--

INSERT INTO `san_pham` (`id`, `ten_san_pham`, `slug`, `danh_muc_id`, `thuong_hieu_id`, `gia`, `gia_khuyen_mai`, `so_luong`, `hinh_anh`, `mo_ta_ngan`, `mo_ta`, `luot_xem`, `status`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 15 128GB', 'iphone-15-128gb', 1, 1, 19990000.00, 18490000.00, 19, 'uploads/products/iphone-15.jpg', 'Dien thoai Apple iPhone 15 128GB', 'Man hinh sac net, camera chat luong, hieu nang manh.', 125, 1, '2026-10-30 17:36:27', '2026-11-01 07:12:05'),
(2, 'Samsung Galaxy S24 256GB', 'samsung-galaxy-s24-256gb', 1, 2, 19990000.00, 17990000.00, 18, 'uploads/products/galaxy-s24.jpg', 'Dien thoai Samsung Galaxy S24', 'Thiet ke hien dai, camera da dung va hieu nang cao.', 98, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'ASUS Vivobook 15', 'asus-vivobook-15', 2, 3, 15990000.00, 14990000.00, 12, 'uploads/products/asus-vivobook-15.jpg', 'Laptop phuc vu hoc tap va van phong', 'Laptop man hinh 15 inch, phu hop hoc tap va lam viec.', 76, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 'Tai nghe Logitech H390', 'tai-nghe-logitech-h390', 4, 4, 890000.00, 790000.00, 34, 'uploads/products/logitech-h390.jpg', 'Tai nghe USB co microphone', 'Tai nghe phuc vu hoc truc tuyen va hop truc tuyen.', 51, 1, '2026-10-30 17:36:27', '2026-10-30 10:46:11'),
(5, 'Sac nhanh Anker 20W', 'sac-nhanh-anker-20w', 5, 5, 490000.00, 390000.00, 50, 'uploads/products/anker-20w.jpg', 'Bo sac nhanh cong suat 20W', 'Bo sac nho gon, ho tro sac nhanh cho thiet bi tuong thich.', 143, 1, '2026-10-30 17:36:27', '2026-10-31 12:14:24'),
(6, 'Cap USB-C Anker 1m', 'cap-usb-c-anker-1m', 5, 5, 250000.00, NULL, 60, 'uploads/products/anker-usbc-1m.jpg', 'Cap sac USB-C dai 1 met', 'Cap sac va truyen du lieu cho thiet bi tuong thich.', 32, 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thuong_hieu`
--

CREATE TABLE `thuong_hieu` (
  `id` int(11) NOT NULL,
  `ten_thuong_hieu` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thuong_hieu`
--

INSERT INTO `thuong_hieu` (`id`, `ten_thuong_hieu`, `slug`, `mo_ta`, `logo`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Apple', 'apple', 'Thuong hieu thiet bi cong nghe Apple', 'uploads/brands/apple.png', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'Samsung', 'samsung', 'Thuong hieu dien tu Samsung', 'uploads/brands/samsung.png', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'ASUS', 'asus', 'Thuong hieu may tinh ASUS', 'uploads/brands/asus.png', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(4, 'Logitech', 'logitech', 'Thuong hieu phu kien Logitech', 'uploads/brands/logitech.png', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(5, 'Anker', 'anker', 'Thuong hieu sac va phu kien Anker', 'uploads/brands/anker.png', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trang_don`
--

CREATE TABLE `trang_don` (
  `id` int(11) NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `noi_dung` longtext DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `trang_don`
--

INSERT INTO `trang_don` (`id`, `tieu_de`, `slug`, `noi_dung`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Gioi thieu', 'gioi-thieu', 'Chao mung ban den voi Ecommerce THLTW. Chung toi cung cap cac san pham cong nghe phuc vu hoc tap va lam viec.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(2, 'Chinh sach bao mat', 'chinh-sach-bao-mat', 'Thong tin ca nhan cua khach hang duoc su dung cho muc dich xu ly don hang va ho tro dich vu.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27'),
(3, 'Chinh sach doi tra', 'chinh-sach-doi-tra', 'Khach hang vui long lien he bo phan ho tro de duoc huong dan quy trinh doi tra theo chinh sach cua cua hang.', 1, '2026-10-30 17:36:27', '2026-10-30 17:36:27');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bai_viet`
--
ALTER TABLE `bai_viet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `chu_de_id` (`chu_de_id`);

--
-- Chỉ mục cho bảng `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cau_hinh_website`
--
ALTER TABLE `cau_hinh_website`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `don_hang_id` (`don_hang_id`),
  ADD KEY `san_pham_id` (`san_pham_id`);

--
-- Chỉ mục cho bảng `chi_tiet_gio_hang`
--
ALTER TABLE `chi_tiet_gio_hang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gio_hang_id` (`gio_hang_id`),
  ADD KEY `san_pham_id` (`san_pham_id`);

--
-- Chỉ mục cho bảng `chi_tiet_phieu_kho`
--
ALTER TABLE `chi_tiet_phieu_kho`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phieu_kho_id` (`phieu_kho_id`),
  ADD KEY `san_pham_id` (`san_pham_id`);

--
-- Chỉ mục cho bảng `chu_de_bai_viet`
--
ALTER TABLE `chu_de_bai_viet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Chỉ mục cho bảng `danh_muc`
--
ALTER TABLE `danh_muc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Chỉ mục cho bảng `dat_lai_mat_khau`
--
ALTER TABLE `dat_lai_mat_khau`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `nguoi_dung_id` (`nguoi_dung_id`);

--
-- Chỉ mục cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_don_hang` (`ma_don_hang`),
  ADD KEY `nguoi_dung_id` (`nguoi_dung_id`);

--
-- Chỉ mục cho bảng `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nguoi_dung_id` (`nguoi_dung_id`);

--
-- Chỉ mục cho bảng `hinh_anh_san_pham`
--
ALTER TABLE `hinh_anh_san_pham`
  ADD PRIMARY KEY (`id`),
  ADD KEY `san_pham_id` (`san_pham_id`);

--
-- Chỉ mục cho bảng `khuyen_mai`
--
ALTER TABLE `khuyen_mai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_khuyen_mai` (`ma_khuyen_mai`);

--
-- Chỉ mục cho bảng `lich_su_trang_thai_don_hang`
--
ALTER TABLE `lich_su_trang_thai_don_hang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `don_hang_id` (`don_hang_id`),
  ADD KEY `nguoi_thuc_hien_id` (`nguoi_thuc_hien_id`);

--
-- Chỉ mục cho bảng `lien_he`
--
ALTER TABLE `lien_he`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `muc_menu`
--
ALTER TABLE `muc_menu`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Chỉ mục cho bảng `phieu_kho`
--
ALTER TABLE `phieu_kho`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_phieu` (`ma_phieu`),
  ADD KEY `nguoi_tao_id` (`nguoi_tao_id`);

--
-- Chỉ mục cho bảng `san_pham`
--
ALTER TABLE `san_pham`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `danh_muc_id` (`danh_muc_id`),
  ADD KEY `thuong_hieu_id` (`thuong_hieu_id`);

--
-- Chỉ mục cho bảng `thuong_hieu`
--
ALTER TABLE `thuong_hieu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Chỉ mục cho bảng `trang_don`
--
ALTER TABLE `trang_don`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bai_viet`
--
ALTER TABLE `bai_viet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `banner`
--
ALTER TABLE `banner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `cau_hinh_website`
--
ALTER TABLE `cau_hinh_website`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `chi_tiet_gio_hang`
--
ALTER TABLE `chi_tiet_gio_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `chi_tiet_phieu_kho`
--
ALTER TABLE `chi_tiet_phieu_kho`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `chu_de_bai_viet`
--
ALTER TABLE `chu_de_bai_viet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `danh_muc`
--
ALTER TABLE `danh_muc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `dat_lai_mat_khau`
--
ALTER TABLE `dat_lai_mat_khau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `gio_hang`
--
ALTER TABLE `gio_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `hinh_anh_san_pham`
--
ALTER TABLE `hinh_anh_san_pham`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `khuyen_mai`
--
ALTER TABLE `khuyen_mai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `lich_su_trang_thai_don_hang`
--
ALTER TABLE `lich_su_trang_thai_don_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `lien_he`
--
ALTER TABLE `lien_he`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `muc_menu`
--
ALTER TABLE `muc_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `phieu_kho`
--
ALTER TABLE `phieu_kho`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `san_pham`
--
ALTER TABLE `san_pham`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `thuong_hieu`
--
ALTER TABLE `thuong_hieu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `trang_don`
--
ALTER TABLE `trang_don`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bai_viet`
--
ALTER TABLE `bai_viet`
  ADD CONSTRAINT `bai_viet_ibfk_1` FOREIGN KEY (`chu_de_id`) REFERENCES `chu_de_bai_viet` (`id`);

--
-- Các ràng buộc cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`don_hang_id`) REFERENCES `don_hang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham` (`id`);

--
-- Các ràng buộc cho bảng `chi_tiet_gio_hang`
--
ALTER TABLE `chi_tiet_gio_hang`
  ADD CONSTRAINT `chi_tiet_gio_hang_ibfk_1` FOREIGN KEY (`gio_hang_id`) REFERENCES `gio_hang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_gio_hang_ibfk_2` FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham` (`id`);

--
-- Các ràng buộc cho bảng `chi_tiet_phieu_kho`
--
ALTER TABLE `chi_tiet_phieu_kho`
  ADD CONSTRAINT `chi_tiet_phieu_kho_ibfk_1` FOREIGN KEY (`phieu_kho_id`) REFERENCES `phieu_kho` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_phieu_kho_ibfk_2` FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham` (`id`);

--
-- Các ràng buộc cho bảng `dat_lai_mat_khau`
--
ALTER TABLE `dat_lai_mat_khau`
  ADD CONSTRAINT `dat_lai_mat_khau_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`);

--
-- Các ràng buộc cho bảng `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD CONSTRAINT `gio_hang_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hinh_anh_san_pham`
--
ALTER TABLE `hinh_anh_san_pham`
  ADD CONSTRAINT `hinh_anh_san_pham_ibfk_1` FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lich_su_trang_thai_don_hang`
--
ALTER TABLE `lich_su_trang_thai_don_hang`
  ADD CONSTRAINT `lich_su_trang_thai_don_hang_ibfk_1` FOREIGN KEY (`don_hang_id`) REFERENCES `don_hang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lich_su_trang_thai_don_hang_ibfk_2` FOREIGN KEY (`nguoi_thuc_hien_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `phieu_kho`
--
ALTER TABLE `phieu_kho`
  ADD CONSTRAINT `phieu_kho_ibfk_1` FOREIGN KEY (`nguoi_tao_id`) REFERENCES `nguoi_dung` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `san_pham`
--
ALTER TABLE `san_pham`
  ADD CONSTRAINT `san_pham_ibfk_1` FOREIGN KEY (`danh_muc_id`) REFERENCES `danh_muc` (`id`),
  ADD CONSTRAINT `san_pham_ibfk_2` FOREIGN KEY (`thuong_hieu_id`) REFERENCES `thuong_hieu` (`id`);
--
