<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DatHangRequest;
use App\Http\Resources\DonHangResource;
use App\Models\DonHang;
use App\Models\GioHang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DonHangController extends Controller
{
    public function index(Request $request)
    {
        $donHangs = DonHang::with('chiTiets.sanPham')
            ->when($request->user(), fn ($query, $user) => $query->where('nguoi_dung_id', $user->id))
            ->when(!$request->user() && $request->filled('session_id'), function ($query) {
                $query->whereNull('nguoi_dung_id');
            })
            ->latest('id')
            ->paginate((int) $request->input('per_page', 12));

        return DonHangResource::collection($donHangs);
    }

    public function show(Request $request, DonHang $donHang): DonHangResource
    {
        $this->kiemTraQuyenXem($request, $donHang);

        return new DonHangResource($donHang->load('chiTiets.sanPham'));
    }

    public function store(DatHangRequest $request): DonHangResource|JsonResponse
    {
        $donHang = DB::transaction(function () use ($request) {
            $gioHang = $this->layGioHang($request)->load('chiTiets.sanPham');

            if ($gioHang->chiTiets->isEmpty()) {
                abort(422, 'Giỏ hàng đang trống');
            }

            $tongTien = 0;
            foreach ($gioHang->chiTiets as $chiTiet) {
                $sanPham = $chiTiet->sanPham()->lockForUpdate()->first();
                if (!$sanPham || !$sanPham->status || $chiTiet->so_luong > $sanPham->so_luong) {
                    abort(422, 'Sản phẩm không đủ số lượng trong kho: '.($sanPham?->ten_san_pham ?? 'không tồn tại'));
                }
                $donGia = (float) ($sanPham->gia_khuyen_mai ?? $sanPham->gia);
                $tongTien += $donGia * $chiTiet->so_luong;
            }

            $donHang = DonHang::create([
                'ma_don_hang' => 'DH'.now()->format('YmdHis').strtoupper(Str::random(4)),
                'nguoi_dung_id' => $request->user()?->id,
                'ho_ten' => $request->ho_ten,
                'so_dien_thoai' => $request->so_dien_thoai,
                'dia_chi_giao_hang' => $request->dia_chi_giao_hang,
                'tong_tien' => $tongTien,
                'phuong_thuc_thanh_toan' => $request->phuong_thuc_thanh_toan,
                'trang_thai' => 'cho_xac_nhan',
            ]);

            foreach ($gioHang->chiTiets as $chiTiet) {
                $sanPham = $chiTiet->sanPham()->lockForUpdate()->first();
                $donGia = (float) ($sanPham->gia_khuyen_mai ?? $sanPham->gia);
                $sanPham->decrement('so_luong', $chiTiet->so_luong);
                $donHang->chiTiets()->create([
                    'san_pham_id' => $sanPham->id,
                    'ten_san_pham' => $sanPham->ten_san_pham,
                    'so_luong' => $chiTiet->so_luong,
                    'don_gia' => $donGia,
                    'thanh_tien' => $donGia * $chiTiet->so_luong,
                ]);
            }

            $gioHang->chiTiets()->delete();

            return $donHang;
        });

        return new DonHangResource($donHang->load('chiTiets.sanPham'));
    }

    public function cancel(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $this->kiemTraQuyenXem($request, $donHang);

        if ($donHang->trang_thai !== 'cho_xac_nhan') {
            return response()->json(['message' => 'Chỉ đơn chờ xác nhận mới có thể huỷ'], 422);
        }

        $donHang->update(['trang_thai' => 'da_huy']);

        return new DonHangResource($donHang->fresh('chiTiets.sanPham'));
    }

    private function layGioHang(Request $request): GioHang
    {
        $userId = $request->user()?->id;
        $sessionId = $request->input('session_id', $request->header('X-Session-Id'));

        if (!$userId && !$sessionId) {
            abort(422, 'Cần session_id khi chưa đăng nhập');
        }

        return GioHang::where($userId ? 'nguoi_dung_id' : 'session_id', $userId ?: $sessionId)->firstOrFail();
    }

    private function kiemTraQuyenXem(Request $request, DonHang $donHang): void
    {
        if ($request->user() && $donHang->nguoi_dung_id !== $request->user()->id) {
            abort(403, 'Bạn không có quyền xem đơn hàng này');
        }
    }
}
