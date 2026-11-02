<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhieuKho;
use App\Models\SanPham;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminKhoController extends Controller
{
    public function index(Request $request)
    {
        $query = PhieuKho::with(['chiTiets.sanPham', 'nguoiTao'])->orderByDesc('id');
        if ($request->filled('loai_phieu')) {
            $query->where('loai_phieu', $request->loai_phieu);
        }
        if ($request->filled('tu_ngay')) {
            $query->whereDate('created_at', '>=', $request->tu_ngay);
        }
        if ($request->filled('den_ngay')) {
            $query->whereDate('created_at', '<=', $request->den_ngay);
        }
        if ($request->filled('keyword')) {
            $keyword = '%'.$request->keyword.'%';
            $query->where(function ($builder) use ($keyword) {
                $builder->where('ma_phieu', 'like', $keyword)
                    ->orWhere('ghi_chu', 'like', $keyword);
            });
        }

        return $request->filled('per_page')
            ? $query->paginate((int) $request->per_page)->withQueryString()
            : response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'loai_phieu' => 'required|in:nhap,xuat',
            'ghi_chu' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1|max:100',
            'items.*.san_pham_id' => 'required|integer|distinct|exists:san_pham,id',
            'items.*.so_luong' => 'required|integer|min:1|max:100000',
            'items.*.don_gia' => 'nullable|numeric|min:0',
        ]);

        $phieu = DB::transaction(function () use ($request, $data) {
            $products = SanPham::whereIn('id', collect($data['items'])->pluck('san_pham_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($data['items'] as $item) {
                $product = $products->get($item['san_pham_id']);
                if (!$product) {
                    throw ValidationException::withMessages(['items' => ['Có sản phẩm không còn tồn tại.']]);
                }
                if ($data['loai_phieu'] === 'xuat' && $product->so_luong < $item['so_luong']) {
                    throw ValidationException::withMessages([
                        'items' => ["{$product->ten_san_pham} chỉ còn {$product->so_luong} sản phẩm trong kho."],
                    ]);
                }
            }

            $phieu = PhieuKho::create([
                'ma_phieu' => 'PK'.now()->format('YmdHis').strtoupper(Str::random(4)),
                'loai_phieu' => $data['loai_phieu'],
                'ghi_chu' => $data['ghi_chu'] ?? null,
                'nguoi_tao_id' => $request->user()->id,
            ]);

            foreach ($data['items'] as $item) {
                $product = $products->get($item['san_pham_id']);
                $phieu->chiTiets()->create([
                    'san_pham_id' => $product->id,
                    'so_luong' => $item['so_luong'],
                    'don_gia' => $item['don_gia'] ?? 0,
                ]);
                if ($data['loai_phieu'] === 'nhap') {
                    $product->increment('so_luong', $item['so_luong']);
                } else {
                    $product->decrement('so_luong', $item['so_luong']);
                }
            }

            return $phieu;
        });

        return response()->json([
            'message' => 'Đã tạo phiếu kho và cập nhật tồn kho.',
            'data' => $phieu->load(['chiTiets.sanPham', 'nguoiTao']),
        ], 201);
    }

    public function show(PhieuKho $phieuKho): JsonResponse
    {
        return response()->json(['data' => $phieuKho->load(['chiTiets.sanPham', 'nguoiTao'])]);
    }
}
