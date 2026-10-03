<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChiTietDonHangResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'san_pham_id' => $this->san_pham_id,
            'ten_san_pham' => $this->ten_san_pham,
            'so_luong' => $this->so_luong,
            'don_gia' => $this->don_gia,
            'thanh_tien' => $this->thanh_tien,
            'san_pham' => new SanPhamResource($this->whenLoaded('sanPham')),
        ];
    }
}
