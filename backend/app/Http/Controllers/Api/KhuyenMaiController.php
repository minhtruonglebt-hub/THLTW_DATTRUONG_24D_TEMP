<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\KhuyenMaiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KhuyenMaiController extends Controller
{
    public function kiemTra(Request $request, KhuyenMaiService $service): JsonResponse
    {
        $data = $request->validate([
            'ma_khuyen_mai' => 'required|string|max:50',
            'tam_tinh' => 'required|numeric|min:0',
        ]);
        $result = $service->tinh($data['ma_khuyen_mai'], (float) $data['tam_tinh']);

        return response()->json([
            'data' => [
                'ma_khuyen_mai' => $result['khuyen_mai']->ma_khuyen_mai,
                'ten_khuyen_mai' => $result['khuyen_mai']->ten_khuyen_mai,
                'tien_giam' => $result['tien_giam'],
                'tong_tien' => max(0, (float) $data['tam_tinh'] - $result['tien_giam']),
            ],
        ]);
    }
}
