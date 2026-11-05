<?php

use App\Http\Controllers\Api\AdminDonHangController;
use App\Http\Controllers\Api\AdminLienHeController;
use App\Http\Controllers\Api\AdminKhuyenMaiController;
use App\Http\Controllers\Api\AdminKhoController;
use App\Http\Controllers\Api\AdminNoiDungController;
use App\Http\Controllers\Api\AdminNguoiDungController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\DanhMucController;
use App\Http\Controllers\Api\DonHangController;
use App\Http\Controllers\Api\GioHangController;
use App\Http\Controllers\Api\HinhAnhSanPhamController;
use App\Http\Controllers\Api\LienHeController;
use App\Http\Controllers\Api\KhuyenMaiController;
use App\Http\Controllers\Api\SanPhamController;
use App\Http\Controllers\Api\ThuongHieuController;
use App\Http\Controllers\Api\WebsiteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  (tất cả đều có tiền tố /api, vd: http://127.0.0.1:8000/api/danh-muc)
|--------------------------------------------------------------------------
| Giai đoạn này CHƯA đặt token (auth:sanctum) cho các route CRUD,
| chỉ cần gọi bằng Postman là chạy ra kết quả.
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ===================== NGƯỜI DÙNG =====================
Route::post('/auth/dang-ky', [AuthController::class, 'register']);
Route::post('/auth/dang-nhap', [AuthController::class, 'login']);
Route::post('/auth/quen-mat-khau', [AuthController::class, 'forgotPassword']);
Route::post('/auth/dat-lai-mat-khau', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/me', [AuthController::class, 'updateProfile']);
    Route::put('/auth/doi-mat-khau', [AuthController::class, 'changePassword']);
    Route::post('/auth/dang-xuat', [AuthController::class, 'logout']);
});

// ===================== DANH MỤC =====================
Route::get('/danh-muc', [DanhMucController::class, 'index']);                // danh sách
Route::get('/danh-muc/{slug}', [DanhMucController::class, 'show']);          // xem 1 danh mục (theo slug)

// ===================== THƯƠNG HIỆU (nhãn hàng) =====================
Route::get('/thuong-hieu', [ThuongHieuController::class, 'index']);
Route::get('/thuong-hieu/{slug}', [ThuongHieuController::class, 'show']);

// ===================== SẢN PHẨM =====================
Route::get('/san-pham', [SanPhamController::class, 'index']);
Route::get('/san-pham/{identifier}/lien-quan', [SanPhamController::class, 'related']);
Route::get('/san-pham/{slug}', [SanPhamController::class, 'show']);

// ===================== ẢNH PHỤ CỦA SẢN PHẨM =====================

// ===================== GIỎ HÀNG =====================
Route::get('/gio-hang', [GioHangController::class, 'index']);
Route::post('/gio-hang', [GioHangController::class, 'store']);
Route::put('/gio-hang/{chiTiet}', [GioHangController::class, 'update']);
Route::delete('/gio-hang/{chiTiet}', [GioHangController::class, 'destroy']);
Route::delete('/gio-hang', [GioHangController::class, 'clear']);

// ===================== ĐƠN HÀNG =====================
Route::get('/don-hang', [DonHangController::class, 'index']);
Route::post('/don-hang', [DonHangController::class, 'store']);
Route::get('/don-hang/{donHang}', [DonHangController::class, 'show']);
Route::post('/don-hang/{donHang}/huy', [DonHangController::class, 'cancel']);

// ===================== THANH TOÁN MOMO =====================
Route::post('/don-hang/{donHang}/momo', [DonHangController::class, 'taoThanhToanMomo']);          // tạo / tạo lại mã QR
Route::get('/don-hang/{donHang}/momo/trang-thai', [DonHangController::class, 'trangThaiMomo']);   // hỏi MoMo đã trả tiền chưa
Route::post('/momo/ipn', [DonHangController::class, 'momoIpn']);                                  // MoMo gọi về (không cần đăng nhập)
Route::post('/don-hang/{donHang}/da-chuyen-khoan', [DonHangController::class, 'baoDaChuyenKhoan']);     // khách bấm "Tôi đã chuyển khoản" (QR cá nhân)

// ===================== BÀI VIẾT & LIÊN HỆ (công khai) =====================
Route::get('/chu-de-bai-viet', [BaiVietController::class, 'chuDe']);
Route::get('/bai-viet', [BaiVietController::class, 'index']);
Route::get('/bai-viet/{slug}', [BaiVietController::class, 'show']);
Route::get('/trang-don/{slug}', [WebsiteController::class, 'page']);
Route::get('/menu', [WebsiteController::class, 'menu']);
Route::get('/banner', [WebsiteController::class, 'banners']);
Route::get('/cau-hinh-website', [WebsiteController::class, 'settings']);
Route::post('/khuyen-mai/kiem-tra', [KhuyenMaiController::class, 'kiemTra'])->middleware('throttle:20,1');
Route::post('/lien-he', [LienHeController::class, 'store'])->middleware('throttle:5,1'); // tối đa 5 lần / phút / người

// ===================== ADMIN =====================
// Bắt buộc đăng nhập (Bearer token) VÀ vai_tro = 'admin'; sai thì trả 401 / 403.
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // --- Thêm / sửa / xoá danh mục, thương hiệu, sản phẩm, ảnh phụ ---
    Route::post('/danh-muc', [DanhMucController::class, 'store']);
    Route::put('/danh-muc/{danhMuc}', [DanhMucController::class, 'update']);
    Route::delete('/danh-muc/{danhMuc}', [DanhMucController::class, 'destroy']);

    Route::post('/thuong-hieu', [ThuongHieuController::class, 'store']);
    Route::put('/thuong-hieu/{thuongHieu}', [ThuongHieuController::class, 'update']);
    Route::delete('/thuong-hieu/{thuongHieu}', [ThuongHieuController::class, 'destroy']);

    Route::post('/san-pham', [SanPhamController::class, 'store']);
    Route::put('/san-pham/{sanPham}', [SanPhamController::class, 'update']);
    Route::post('/san-pham/{sanPham}', [SanPhamController::class, 'update']);
    Route::delete('/san-pham/{sanPham}', [SanPhamController::class, 'destroy']);
    Route::post('/san-pham/{sanPham}/hinh-anh', [HinhAnhSanPhamController::class, 'store']);
    Route::delete('/hinh-anh-san-pham/{hinhAnh}', [HinhAnhSanPhamController::class, 'destroy']);

    // Admin xác nhận đã nhận tiền MoMo
    Route::post('/don-hang/{donHang}/xac-nhan-thanh-toan', [DonHangController::class, 'xacNhanThanhToan']);

    Route::prefix('admin')->group(function () {
        $c = \App\Http\Controllers\Api\AdminController::class;
        Route::get('/danh-muc', [$c, 'danhMuc']);
        Route::get('/thuong-hieu', [$c, 'thuongHieu']);
        Route::get('/san-pham', [$c, 'sanPham']);
        Route::get('/gio-hang', [$c, 'gioHang']);

        Route::get('/chu-de-bai-viet', [AdminNoiDungController::class, 'topics']);
        Route::get('/bai-viet', [AdminNoiDungController::class, 'posts']);
        Route::get('/trang-don', [AdminNoiDungController::class, 'pages']);
        Route::get('/muc-menu', [AdminNoiDungController::class, 'menus']);
        Route::get('/banner', [AdminNoiDungController::class, 'banners']);
        Route::get('/cau-hinh-website', [AdminNoiDungController::class, 'settings']);
        Route::get('/khuyen-mai', [AdminKhuyenMaiController::class, 'index']);
        Route::get('/phieu-kho', [AdminKhoController::class, 'index']);
        Route::get('/phieu-kho/{phieuKho}', [AdminKhoController::class, 'show']);

        Route::post('/phieu-kho', [AdminKhoController::class, 'store']);
        Route::post('/chu-de-bai-viet', [AdminNoiDungController::class, 'storeTopic']);
        Route::put('/chu-de-bai-viet/{chuDeBaiViet}', [AdminNoiDungController::class, 'updateTopic']);
        Route::delete('/chu-de-bai-viet/{chuDeBaiViet}', [AdminNoiDungController::class, 'destroyTopic']);
        Route::post('/bai-viet', [AdminNoiDungController::class, 'storePost']);
        Route::post('/bai-viet/{baiViet}', [AdminNoiDungController::class, 'updatePost']);
        Route::delete('/bai-viet/{baiViet}', [AdminNoiDungController::class, 'destroyPost']);
        Route::post('/trang-don', [AdminNoiDungController::class, 'storePage']);
        Route::put('/trang-don/{trangDon}', [AdminNoiDungController::class, 'updatePage']);
        Route::delete('/trang-don/{trangDon}', [AdminNoiDungController::class, 'destroyPage']);
        Route::post('/muc-menu', [AdminNoiDungController::class, 'storeMenu']);
        Route::put('/muc-menu/{mucMenu}', [AdminNoiDungController::class, 'updateMenu']);
        Route::delete('/muc-menu/{mucMenu}', [AdminNoiDungController::class, 'destroyMenu']);
        Route::post('/banner', [AdminNoiDungController::class, 'storeBanner']);
        Route::post('/banner/{banner}', [AdminNoiDungController::class, 'updateBanner']);
        Route::delete('/banner/{banner}', [AdminNoiDungController::class, 'destroyBanner']);
        Route::post('/cau-hinh-website', [AdminNoiDungController::class, 'updateSettings']);
        Route::post('/khuyen-mai', [AdminKhuyenMaiController::class, 'store']);
        Route::put('/khuyen-mai/{khuyenMai}', [AdminKhuyenMaiController::class, 'update']);
        Route::delete('/khuyen-mai/{khuyenMai}', [AdminKhuyenMaiController::class, 'destroy']);

        // Đơn hàng: danh sách có lọc, chi tiết, đổi trạng thái, huỷ
        Route::get('/don-hang', [AdminDonHangController::class, 'index']);
        Route::get('/don-hang/{donHang}', [AdminDonHangController::class, 'show']);
        Route::put('/don-hang/{donHang}/trang-thai', [AdminDonHangController::class, 'capNhatTrangThai']);
        Route::post('/don-hang/{donHang}/huy', [AdminDonHangController::class, 'huy']);

        // Thành viên: danh sách, chi tiết + lịch sử đơn, khoá / mở khoá, xoá
        Route::get('/nguoi-dung', [AdminNguoiDungController::class, 'index']);
        Route::get('/nguoi-dung/{user}', [AdminNguoiDungController::class, 'show']);
        Route::post('/nguoi-dung/{user}/khoa', [AdminNguoiDungController::class, 'khoa']);
        Route::delete('/nguoi-dung/{user}', [AdminNguoiDungController::class, 'destroy']);

        // Liên hệ: danh sách, chi tiết, phản hồi / đánh dấu đã xử lý, xoá
        Route::get('/lien-he', [AdminLienHeController::class, 'index']);
        Route::get('/lien-he/{lienHe}', [AdminLienHeController::class, 'show']);
        Route::put('/lien-he/{lienHe}', [AdminLienHeController::class, 'update']);
        Route::delete('/lien-he/{lienHe}', [AdminLienHeController::class, 'destroy']);
    });
});
