<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CapNhatGioHangRequest;
use App\Http\Requests\GioHangRequest;
use App\Http\Resources\GioHangResource;
use App\Models\GioHang;
use App\Models\SanPham;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GioHangController extends Controller
{
    public function index(Request $request): GioHangResource
    {
        return new GioHangResource($this->layGioHang($request));
    }

    public function store(GioHangRequest $request): GioHangResource|JsonResponse
    {
        $sanPham = SanPham::where('status', 1)->findOrFail($request->san_pham_id);
        $gioHang = $this->layGioHang($request);
        $chiTiet = $gioHang->chiTiets()->where('san_pham_id', $sanPham->id)->first();
        $soLuongMoi = ($chiTiet?->so_luong ?? 0) + $request->so_luong;

        if ($sanPham->so_luong < 1) {
            return response()->json(['message' => 'HẾT HÀNG', 'so_luong_con_lai' => 0], 422);
        }

        if ($soLuongMoi > $sanPham->so_luong) {
            return response()->json([
                'message' => 'Số lượng sản phẩm trong kho không đủ',
                'so_luong_con_lai' => $sanPham->so_luong,
            ], 422);
        }

        $chiTiet = $gioHang->chiTiets()->updateOrCreate(
            ['san_pham_id' => $sanPham->id],
            ['so_luong' => $soLuongMoi]
        );

        return new GioHangResource($gioHang->fresh(['chiTiets.sanPham']));
    }

    public function update(CapNhatGioHangRequest $request, int $chiTiet): GioHangResource|JsonResponse
    {
        $gioHang = $this->layGioHang($request);
        $chiTietGioHang = $gioHang->chiTiets()->with('sanPham')->findOrFail($chiTiet);

        if ($chiTietGioHang->sanPham->so_luong < 1) {
            return response()->json(['message' => 'HẾT HÀNG', 'so_luong_con_lai' => 0], 422);
        }

        if ($request->so_luong > $chiTietGioHang->sanPham->so_luong) {
            return response()->json([
                'message' => 'Số lượng sản phẩm trong kho không đủ',
                'so_luong_con_lai' => $chiTietGioHang->sanPham->so_luong,
            ], 422);
        }

        $chiTietGioHang->update(['so_luong' => $request->so_luong]);

        return new GioHangResource($gioHang->fresh(['chiTiets.sanPham']));
    }

    public function destroy(Request $request, int $chiTiet): GioHangResource
    {
        $gioHang = $this->layGioHang($request);
        $gioHang->chiTiets()->findOrFail($chiTiet)->delete();

        return new GioHangResource($gioHang->fresh(['chiTiets.sanPham']));
    }

    public function clear(Request $request): JsonResponse
    {
        $this->layGioHang($request)->chiTiets()->delete();

        return response()->json(['message' => 'Đã xoá toàn bộ giỏ hàng']);
    }

    private function layGioHang(Request $request): GioHang
    {
        $userId = $request->user()?->id;
        $sessionId = $request->input('session_id', $request->header('X-Session-Id'));

        if (!$userId && !$sessionId) {
            abort(422, 'Cần session_id khi chưa đăng nhập');
        }

        return GioHang::firstOrCreate(
            $userId ? ['nguoi_dung_id' => $userId] : ['session_id' => $sessionId],
            $userId ? ['session_id' => null] : ['nguoi_dung_id' => null]
        )->load('chiTiets.sanPham');
    }
}
