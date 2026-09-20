<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ThuongHieuResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'ten_thuong_hieu' => $this->ten_thuong_hieu,
            'slug'            => $this->slug,
            'mo_ta'           => $this->mo_ta,

            // đường dẫn lưu trong DB, vd: thuong-hieu/abc.png
            'logo'            => $this->logo,
            // link đầy đủ để <img src="..."> hiển thị được
            'logo_url'        => $this->logo
                                    ? Storage::disk('public')->url($this->logo)
                                    : null,

            'status'          => (bool) $this->status,
        ];
    }
}
