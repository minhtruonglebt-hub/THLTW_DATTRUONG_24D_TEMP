<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ThuongHieuRequest;
use App\Http\Resources\ThuongHieuResource;
use App\Models\ThuongHieu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ThuongHieuController extends Controller
{
    // GET /api/thuong-hieu
    public function index(): AnonymousResourceCollection
    {
        $thuongHieus = ThuongHieu::active()
            ->orderBy('id')
            ->get();

        return ThuongHieuResource::collection($thuongHieus);
    }

    // GET /api/thuong-hieu/{slug}
    // firstOrFail() sẽ tự động trả lỗi 404 nếu không tìm thấy.
    public function show(string $slug): ThuongHieuResource
    {
        $thuongHieu = ThuongHieu::active()
            ->where('slug', $slug)
            ->firstOrFail();

        return new ThuongHieuResource($thuongHieu);
    }

    // POST /api/thuong-hieu
    // multipart/form-data: ten_thuong_hieu, mo_ta, status, logo (file, tuỳ chọn)
    public function store(ThuongHieuRequest $request): ThuongHieuResource
    {
        $data = $request->validated();

        $data['slug'] = $this->taoSlugDuyNhat($data['ten_thuong_hieu']);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('thuong-hieu', 'public');
        }

        $thuongHieu = ThuongHieu::create($data)->refresh();

        return new ThuongHieuResource($thuongHieu);
    }

    // POST /api/thuong-hieu/{id} + field _method=PUT  (khi có gửi file logo)
    // hoặc PUT /api/thuong-hieu/{id} với JSON (khi không gửi file)
    public function update(ThuongHieuRequest $request, ThuongHieu $thuongHieu): ThuongHieuResource
    {
        $data = $request->validated();

        if (isset($data['ten_thuong_hieu']) && $data['ten_thuong_hieu'] !== $thuongHieu->ten_thuong_hieu) {
            $data['slug'] = $this->taoSlugDuyNhat($data['ten_thuong_hieu'], $thuongHieu->id);
        }

        // Có logo mới -> xoá logo cũ, lưu logo mới
        if ($request->hasFile('logo')) {
            if ($thuongHieu->logo) {
                Storage::disk('public')->delete($thuongHieu->logo);
            }
            $data['logo'] = $request->file('logo')->store('thuong-hieu', 'public');
        }

        $thuongHieu->update($data);

        return new ThuongHieuResource($thuongHieu->fresh());
    }

    // DELETE /api/thuong-hieu/{id}
    public function destroy(ThuongHieu $thuongHieu): JsonResponse
    {
        // san_pham có khoá ngoại tới thuong_hieu -> kiểm tra trước khi xoá
        if ($thuongHieu->sanPhams()->exists()) {
            return response()->json([
                'message' => 'Không thể xoá: thương hiệu này đang có sản phẩm',
            ], 409);
        }

        if ($thuongHieu->logo) {
            Storage::disk('public')->delete($thuongHieu->logo);
        }

        $thuongHieu->delete();

        return response()->json(['message' => 'Đã xoá thương hiệu thành công']);
    }

    // Sinh slug từ tên, tự thêm hậu tố -1, -2... nếu bị trùng
    private function taoSlugDuyNhat(string $ten, ?int $boQuaId = null): string
    {
        $slugGoc = Str::slug($ten);
        $slug = $slugGoc;
        $i = 1;

        while (
            ThuongHieu::where('slug', $slug)
                ->when($boQuaId, fn ($q) => $q->where('id', '!=', $boQuaId))
                ->exists()
        ) {
            $slug = $slugGoc.'-'.$i++;
        }

        return $slug;
    }
}
