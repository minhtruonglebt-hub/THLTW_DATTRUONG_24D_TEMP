<?php

use App\Http\Controllers\Api\DanhMucController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DonHangController;
use App\Http\Controllers\Api\GioHangController;
use App\Http\Controllers\Api\HinhAnhSanPhamController;
use App\Http\Controllers\Api\SanPhamController;
use App\Http\Controllers\Api\ThuongHieuController;
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
Route::post('/danh-muc', [DanhMucController::class, 'store']);               // thêm
Route::get('/danh-muc/{slug}', [DanhMucController::class, 'show']);          // xem 1 danh mục (theo slug)
Route::put('/danh-muc/{danhMuc}', [DanhMucController::class, 'update']);     // sửa (theo id)
Route::delete('/danh-muc/{danhMuc}', [DanhMucController::class, 'destroy']); // xoá (theo id)

// ===================== THƯƠNG HIỆU (nhãn hàng) =====================
Route::get('/thuong-hieu', [ThuongHieuController::class, 'index']);
Route::post('/thuong-hieu', [ThuongHieuController::class, 'store']);
Route::get('/thuong-hieu/{slug}', [ThuongHieuController::class, 'show']);
Route::put('/thuong-hieu/{thuongHieu}', [ThuongHieuController::class, 'update']);
Route::delete('/thuong-hieu/{thuongHieu}', [ThuongHieuController::class, 'destroy']);

// ===================== SẢN PHẨM =====================
Route::get('/san-pham', [SanPhamController::class, 'index']);
Route::post('/san-pham', [SanPhamController::class, 'store']);
Route::get('/san-pham/{identifier}/lien-quan', [SanPhamController::class, 'related']);
Route::get('/san-pham/{slug}', [SanPhamController::class, 'show']);
Route::put('/san-pham/{sanPham}', [SanPhamController::class, 'update']);
Route::post('/san-pham/{sanPham}', [SanPhamController::class, 'update']);
Route::delete('/san-pham/{sanPham}', [SanPhamController::class, 'destroy']);

// ===================== ẢNH PHỤ CỦA SẢN PHẨM =====================
Route::post('/san-pham/{sanPham}/hinh-anh', [HinhAnhSanPhamController::class, 'store']);
Route::delete('/hinh-anh-san-pham/{hinhAnh}', [HinhAnhSanPhamController::class, 'destroy']);

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


// ===================== ADMIN (chỉ đọc) =====================
Route::prefix('admin')->group(function () {
    $c = \App\Http\Controllers\Api\AdminController::class;
    Route::get('/danh-muc', [$c, 'danhMuc']);
    Route::get('/thuong-hieu', [$c, 'thuongHieu']);
    Route::get('/san-pham', [$c, 'sanPham']);
    Route::get('/don-hang', [$c, 'donHang']);
    Route::get('/gio-hang', [$c, 'gioHang']);
    Route::get('/nguoi-dung', [$c, 'nguoiDung']);
});
