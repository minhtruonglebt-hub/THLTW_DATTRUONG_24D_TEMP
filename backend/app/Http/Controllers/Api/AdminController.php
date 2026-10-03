<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DanhMucResource;
use App\Http\Resources\DonHangResource;
use App\Http\Resources\GioHangResource;
use App\Http\Resources\SanPhamResource;
use App\Http\Resources\ThuongHieuResource;
use App\Models\DanhMuc;
use App\Models\DonHang;
use App\Models\GioHang;
use App\Models\SanPham;
use App\Models\ThuongHieu;
use App\Models\User;

// API chỉ-đọc cho trang admin: trả về TOÀN BỘ dữ liệu (kể cả bản ghi đang ẩn)
class AdminController extends Controller
{
    public function danhMuc()
    {
        return DanhMucResource::collection(DanhMuc::orderBy('id')->get());
    }

    public function thuongHieu()
    {
        return ThuongHieuResource::collection(ThuongHieu::orderBy('id')->get());
    }

    public function sanPham()
    {
        return SanPhamResource::collection(
            SanPham::with(['danhMuc', 'thuongHieu'])->orderByDesc('id')->get()
        );
    }

    public function donHang()
    {
        return DonHangResource::collection(
            DonHang::with('chiTiets.sanPham')->orderByDesc('id')->get()
        );
    }

    public function gioHang()
    {
        return GioHangResource::collection(
            GioHang::with('chiTiets.sanPham')->orderByDesc('id')->get()
        );
    }

    public function nguoiDung()
    {
        return response()->json(['data' => User::orderBy('id')->get()]);
    }
}
