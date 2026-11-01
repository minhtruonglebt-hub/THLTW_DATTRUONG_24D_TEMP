<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BaiVietResource;
use App\Models\BaiViet;
use App\Models\ChuDeBaiViet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BaiVietController extends Controller
{
    // GET /api/bai-viet?chu_de={slug}&tu_khoa=...&page=1
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = BaiViet::active()
            ->with('chuDe:id,ten_chu_de,slug')
            ->select(['id', 'chu_de_id', 'tieu_de', 'slug', 'hinh_anh', 'tom_tat', 'created_at']);

        if ($slug = $request->query('chu_de')) {
            $query->whereHas('chuDe', fn ($q) => $q->where('slug', $slug));
        }

        if ($tuKhoa = trim((string) $request->query('tu_khoa'))) {
            $query->where('tieu_de', 'like', '%'.$tuKhoa.'%');
        }

        $baiViets = $query->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(9)
            ->withQueryString();

        return BaiVietResource::collection($baiViets);
    }

    // GET /api/bai-viet/{slug}
    public function show(string $slug): BaiVietResource
    {
        $baiViet = BaiViet::active()
            ->with('chuDe')
            ->where('slug', $slug)
            ->firstOrFail();

        return new BaiVietResource($baiViet);
    }

    // GET /api/chu-de-bai-viet
    public function chuDe(): JsonResponse
    {
        $chuDes = ChuDeBaiViet::active()
            ->orderBy('id')
            ->get(['id', 'ten_chu_de', 'slug']);

        return response()->json(['data' => $chuDes]);
    }
}
