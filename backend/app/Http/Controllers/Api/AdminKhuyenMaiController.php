<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KhuyenMai;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminKhuyenMaiController extends Controller
{
    public function index(Request $request)
    {
        $query = KhuyenMai::query()->orderByDesc('id');
        if ($request->filled('keyword')) {
            $keyword = '%'.strtoupper(trim($request->keyword)).'%';
            $query->where(function ($builder) use ($keyword) {
                $builder->where('ma_khuyen_mai', 'like', $keyword)
                    ->orWhere('ten_khuyen_mai', 'like', $keyword);
            });
        }
        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        return $request->filled('per_page')
            ? $query->paginate((int) $request->per_page)->withQueryString()
            : response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['ma_khuyen_mai'] = strtoupper(trim($data['ma_khuyen_mai']));

        return response()->json(['data' => KhuyenMai::create($data)], 201);
    }

    public function update(Request $request, KhuyenMai $khuyenMai): JsonResponse
    {
        $data = $this->validated($request, $khuyenMai);
        $data['ma_khuyen_mai'] = strtoupper(trim($data['ma_khuyen_mai']));
        $khuyenMai->update($data);

        return response()->json(['data' => $khuyenMai->fresh()]);
    }

    public function destroy(KhuyenMai $khuyenMai): JsonResponse
    {
        $khuyenMai->delete();

        return response()->json(['message' => 'Đã xóa mã khuyến mãi']);
    }

    private function validated(Request $request, ?KhuyenMai $khuyenMai = null): array
    {
        return $request->validate([
            'ma_khuyen_mai' => ['required', 'string', 'max:50', Rule::unique('khuyen_mai', 'ma_khuyen_mai')->ignore($khuyenMai?->id)],
            'ten_khuyen_mai' => 'required|string|max:255',
            'loai_giam' => 'required|in:phan_tram,so_tien',
            'gia_tri_giam' => 'required|numeric|gt:0'.($request->input('loai_giam') === 'phan_tram' ? '|max:100' : ''),
            'don_toi_thieu' => 'nullable|numeric|min:0',
            'so_lan_su_dung' => 'nullable|integer|min:1',
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after:ngay_bat_dau',
            'status' => 'required|boolean',
        ]);
    }
}
