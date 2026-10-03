<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DanhMucRequest;
use App\Http\Resources\DanhMucResource;
use App\Models\DanhMuc;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class DanhMucController extends Controller
{
    // GET /api/danh-muc
    public function index(): AnonymousResourceCollection
    {
        $danhMucs = DanhMuc::active()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->active()])
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

    // POST /api/danh-muc
    // Body (JSON): ten_danh_muc, mo_ta, parent_id, status
    public function store(DanhMucRequest $request): DanhMucResource
    {
        $data = $request->validated();

        $data['slug'] = $this->taoSlugDuyNhat($data['ten_danh_muc']);

        // refresh() để lấy lại các giá trị mặc định do DB tự gán (vd: status = 1)
        $danhMuc = DanhMuc::create($data)->refresh();

        return new DanhMucResource($danhMuc->load('children'));
    }

    // PUT /api/danh-muc/{id}
    public function update(DanhMucRequest $request, DanhMuc $danhMuc): DanhMucResource
    {
        $data = $request->validated();

        if (isset($data['ten_danh_muc']) && $data['ten_danh_muc'] !== $danhMuc->ten_danh_muc) {
            $data['slug'] = $this->taoSlugDuyNhat($data['ten_danh_muc'], $danhMuc->id);
        }

        $danhMuc->update($data);

        return new DanhMucResource($danhMuc->fresh('children'));
    }

    // DELETE /api/danh-muc/{id}
    public function destroy(DanhMuc $danhMuc): JsonResponse
    {
        // Bảng san_pham có khoá ngoại tới danh_muc -> xoá bừa sẽ báo lỗi 500,
        // nên kiểm tra trước và trả về thông báo dễ hiểu (409 Conflict).
        if ($danhMuc->sanPhams()->exists()) {
            return response()->json([
                'message' => 'Không thể xoá: danh mục này đang có sản phẩm',
            ], 409);
        }

        if ($danhMuc->children()->exists()) {
            return response()->json([
                'message' => 'Không thể xoá: danh mục này đang có danh mục con',
            ], 409);
        }

        $danhMuc->delete();

        return response()->json(['message' => 'Đã xoá danh mục thành công']);
    }

    // Sinh slug từ tên, tự thêm hậu tố -1, -2... nếu bị trùng
    private function taoSlugDuyNhat(string $ten, ?int $boQuaId = null): string
    {
        $slugGoc = Str::slug($ten);
        $slug = $slugGoc;
        $i = 1;

        while (
            DanhMuc::where('slug', $slug)
                ->when($boQuaId, fn ($q) => $q->where('id', '!=', $boQuaId))
                ->exists()
        ) {
            $slug = $slugGoc.'-'.$i++;
        }

        return $slug;
    }
}
