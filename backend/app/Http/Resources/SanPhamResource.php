<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class SanPhamResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'ten_san_pham'   => $this->ten_san_pham,
            'slug'           => $this->slug,
            'danh_muc_id'    => $this->danh_muc_id,
            'thuong_hieu_id' => $this->thuong_hieu_id,
            'gia'            => $this->gia,
            'gia_khuyen_mai' => $this->gia_khuyen_mai,
            'so_luong'       => $this->so_luong,

            // ảnh đại diện (cột hinh_anh trong bảng san_pham)
            'hinh_anh'       => $this->hinh_anh,
            'hinh_anh_url'   => $this->hinh_anh
                                    ? Storage::disk('public')->url($this->hinh_anh)
                                    : null,

            'mo_ta_ngan'     => $this->mo_ta_ngan,
            'mo_ta'          => $this->mo_ta,
            'luot_xem'       => $this->luot_xem,
            'status'         => (bool) $this->status,

            // quan hệ - chỉ xuất hiện khi controller đã with(...)
            'danh_muc'       => new DanhMucResource($this->whenLoaded('danhMuc')),
            'thuong_hieu'    => $this->whenLoaded('thuongHieu', function () {
                return [
                    'id'   => $this->thuongHieu->id,
                    'name' => $this->thuongHieu->ten_thuong_hieu,
                ];
            }),
            // danh sách toàn bộ ảnh phụ (bảng hinh_anh_san_pham)
            'hinh_anhs'      => HinhAnhSanPhamResource::collection(
                                    $this->whenLoaded('hinhAnhs')),

            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
        ];
    }
}
