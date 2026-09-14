<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DanhMucResource;
use App\Models\DanhMuc;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DanhMucController extends Controller
{
    // GET /api/danh-muc
    public function index(): AnonymousResourceCollection
    {
        $danhMucs = DanhMuc::active()                       // status = 1
            ->whereNull('parent_id')                        // chỉ lấy danh mục cấp 1
            ->with(['children' => fn ($q) => $q->active()]) // nạp sẵn danh mục con
            ->orderBy('id')
            ->get();

        return DanhMucResource::collection($danhMucs);
    }

    // GET /api/danh-muc/{slug}
    public function show(string $slug): DanhMucResource
    {
        $danhMuc = DanhMuc::active()
            ->where('slug', $slug)
            ->with(['children' => fn ($q) => $q->active()])
            ->firstOrFail();

        return new DanhMucResource($danhMuc);
    }
}
