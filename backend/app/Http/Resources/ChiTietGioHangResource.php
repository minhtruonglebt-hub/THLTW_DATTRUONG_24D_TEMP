<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChiTietGioHangResource extends JsonResource
{
    public function toArray($request): array
    {
        $gia = $this->sanPham?->gia_khuyen_mai ?? $this->sanPham?->gia;

        return [
            'id' => $this->id,
            'san_pham_id' => $this->san_pham_id,
            'so_luong' => $this->so_luong,
            'don_gia' => $gia,
            'thanh_tien' => $gia !== null ? $this->so_luong * (float) $gia : null,
            'san_pham' => new SanPhamResource($this->whenLoaded('sanPham')),
        ];
    }
}
