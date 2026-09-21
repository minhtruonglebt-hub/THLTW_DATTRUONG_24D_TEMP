<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SanPhamResource;
use App\Models\HinhAnhSanPham;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SanPhamController extends Controller
{
    // GET /api/san-pham
    // Hỗ trợ: ?danh_muc_id=&thuong_hieu_id=&keyword=&per_page=
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = SanPham::query()
            ->where('status', 1)
            ->with(['danhMuc', 'thuongHieu', 'hinhAnhs']);

        if ($request->filled('danh_muc_id')) {
            $query->where('danh_muc_id', $request->danh_muc_id);
        }

        if ($request->filled('thuong_hieu_id')) {
            $query->where('thuong_hieu_id', $request->thuong_hieu_id);
        }

        if ($request->filled('keyword')) {
            $query->where('ten_san_pham', 'like', '%'.$request->keyword.'%');
        }

        $sanPhams = $query->orderByDesc('id')
            ->paginate((int) $request->input('per_page', 12));

        return SanPhamResource::collection($sanPhams);
    }

    // GET /api/san-pham/{slug}
    public function show(string $slug): SanPhamResource
    {
        $sanPham = SanPham::where('slug', $slug)
            ->with(['danhMuc', 'thuongHieu', 'hinhAnhs' => function ($q) {
                $q->where('status', 1)->orderBy('thu_tu');
            }])
            ->firstOrFail();

        // tăng lượt xem mỗi khi có người xem chi tiết sản phẩm
        $sanPham->increment('luot_xem');

        return new SanPhamResource($sanPham);
    }

    // POST /api/san-pham
    // multipart/form-data:
    //   hinh_anh      -> 1 file (ảnh đại diện)
    //   hinh_anhs[]   -> nhiều file (ảnh phụ, tuỳ chọn)
    public function store(Request $request): SanPhamResource
    {
        $data = $request->validate([
            'ten_san_pham'   => 'required|string|max:255',
            'danh_muc_id'    => 'required|integer|exists:danh_muc,id',
            'thuong_hieu_id' => 'required|integer|exists:thuong_hieu,id',
            'gia'            => 'required|numeric|min:0',
            'gia_khuyen_mai' => 'nullable|numeric|min:0',
            'so_luong'       => 'nullable|integer|min:0',
            'mo_ta_ngan'     => 'nullable|string',
            'mo_ta'          => 'nullable|string',
            'status'         => 'nullable|boolean',
            'hinh_anh'       => 'nullable|image|max:2048',       // tối đa 2MB
            'hinh_anhs.*'    => 'nullable|image|max:2048',
        ]);

        $data['slug'] = $this->taoSlugDuyNhat($data['ten_san_pham']);

        // Lưu ảnh đại diện vào storage/app/public/san-pham
        if ($request->hasFile('hinh_anh')) {
            $data['hinh_anh'] = $request->file('hinh_anh')
                ->store('san-pham', 'public');
        }

        $sanPham = SanPham::create($data)->refresh();

        // Lưu các ảnh phụ (nếu có) vào bảng hinh_anh_san_pham
        if ($request->hasFile('hinh_anhs')) {
            foreach ($request->file('hinh_anhs') as $index => $file) {
                $path = $file->store('san-pham', 'public');

                HinhAnhSanPham::create([
                    'san_pham_id' => $sanPham->id,
                    'hinh_anh'    => $path,
                    'thu_tu'      => $index,
                    'status'      => 1,
                ]);
            }
        }

        return new SanPhamResource(
            $sanPham->load(['danhMuc', 'thuongHieu', 'hinhAnhs'])
        );
    }

    // POST /api/san-pham/{id}  (dùng POST + _method=PUT vì multipart/form-data)
    public function update(Request $request, SanPham $sanPham): SanPhamResource
    {
        $data = $request->validate([
            'ten_san_pham'   => 'sometimes|required|string|max:255',
            'danh_muc_id'    => 'sometimes|required|integer|exists:danh_muc,id',
            'thuong_hieu_id' => 'sometimes|required|integer|exists:thuong_hieu,id',
            'gia'            => 'sometimes|required|numeric|min:0',
            'gia_khuyen_mai' => 'nullable|numeric|min:0',
            'so_luong'       => 'nullable|integer|min:0',
            'mo_ta_ngan'     => 'nullable|string',
            'mo_ta'          => 'nullable|string',
            'status'         => 'nullable|boolean',
            'hinh_anh'       => 'nullable|image|max:2048',
        ]);

        if (isset($data['ten_san_pham']) && $data['ten_san_pham'] !== $sanPham->ten_san_pham) {
            $data['slug'] = $this->taoSlugDuyNhat($data['ten_san_pham'], $sanPham->id);
        }

        // Nếu có ảnh đại diện mới -> xoá ảnh cũ, lưu ảnh mới
        if ($request->hasFile('hinh_anh')) {
            if ($sanPham->hinh_anh) {
                Storage::disk('public')->delete($sanPham->hinh_anh);
            }
            $data['hinh_anh'] = $request->file('hinh_anh')->store('san-pham', 'public');
        }

        $sanPham->update($data);

        return new SanPhamResource(
            $sanPham->fresh(['danhMuc', 'thuongHieu', 'hinhAnhs'])
        );
    }

    // DELETE /api/san-pham/{id}
    public function destroy(SanPham $sanPham)
    {
        // xoá ảnh đại diện khỏi ổ đĩa
        if ($sanPham->hinh_anh) {
            Storage::disk('public')->delete($sanPham->hinh_anh);
        }

        // xoá toàn bộ ảnh phụ khỏi ổ đĩa + khỏi DB
        foreach ($sanPham->hinhAnhs as $anh) {
            Storage::disk('public')->delete($anh->hinh_anh);
        }
        $sanPham->hinhAnhs()->delete();

        $sanPham->delete();

        return response()->json(['message' => 'Đã xoá sản phẩm thành công']);
    }

    // Sinh slug từ tên sản phẩm, tự thêm hậu tố nếu bị trùng
    private function taoSlugDuyNhat(string $ten, ?int $boQuaId = null): string
    {
        $slugGoc = Str::slug($ten);
        $slug = $slugGoc;
        $i = 1;

        while (
            SanPham::where('slug', $slug)
                ->when($boQuaId, fn ($q) => $q->where('id', '!=', $boQuaId))
                ->exists()
        ) {
            $slug = $slugGoc.'-'.$i++;
        }

        return $slug;
    }
}
