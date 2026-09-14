<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThuongHieuResource;
use App\Models\ThuongHieu;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ThuongHieuController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $thuongHieus = ThuongHieu::active()
            ->orderBy('id')
            ->get();

        return ThuongHieuResource::collection($thuongHieus);
    }

    // firstOrFail() sẽ tự động trả lỗi 404 nếu không tìm thấy.
    public function show(string $slug): ThuongHieuResource
    {
        $thuongHieu = ThuongHieu::active()
            ->where('slug', $slug)
            ->firstOrFail();

        return new ThuongHieuResource($thuongHieu);
    }
}
