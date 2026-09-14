<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HinhAnhSanPhamResource;
use App\Models\HinhAnhSanPham;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class HinhAnhSanPhamController extends Controller
{
    // POST /api/san-pham/{sanPham}/hinh-anh
    // multipart/form-data: hinh_anhs[] -> nhiều file
    public function store(Request $request, SanPham $sanPham): AnonymousResourceCollection
    {
        $request->validate([
            'hinh_anhs'   => 'required|array|min:1',
            'hinh_anhs.*' => 'image|max:2048',
        ]);

        $thuTuHienTai = (int) $sanPham->hinhAnhs()->max('thu_tu');

        $anhMoi = collect();

        foreach ($request->file('hinh_anhs') as $file) {
            $path = $file->store('san-pham', 'public');

            $anhMoi->push(HinhAnhSanPham::create([
                'san_pham_id' => $sanPham->id,
                'hinh_anh'    => $path,
                'thu_tu'      => ++$thuTuHienTai,
                'status'      => 1,
            ]));
        }

        return HinhAnhSanPhamResource::collection($anhMoi);
    }

    // DELETE /api/hinh-anh-san-pham/{id}
    public function destroy(HinhAnhSanPham $hinhAnh)
    {
        Storage::disk('public')->delete($hinhAnh->hinh_anh);
        $hinhAnh->delete();

        return response()->json(['message' => 'Đã xoá ảnh thành công']);
    }
}
