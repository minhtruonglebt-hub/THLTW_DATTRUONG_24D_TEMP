<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GioHangResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nguoi_dung_id' => $this->nguoi_dung_id,
            'session_id' => $this->session_id,
            'chi_tiets' => ChiTietGioHangResource::collection($this->whenLoaded('chiTiets')),
            'tong_so_luong' => $this->whenLoaded('chiTiets', fn () => (int) $this->chiTiets->sum('so_luong')),
            'tong_tien' => $this->whenLoaded('chiTiets', fn () => $this->chiTiets->sum(
                fn ($chiTiet) => $chiTiet->so_luong * (float) ($chiTiet->sanPham->gia_khuyen_mai ?? $chiTiet->sanPham->gia)
            )),
        ];
    }
}
