<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class HinhAnhSanPhamResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'san_pham_id' => $this->san_pham_id,
            // đường dẫn lưu trong DB, vd: san-pham/abc.jpg
            'hinh_anh'    => $this->hinh_anh,
            // link đầy đủ để <img src="..."> hiển thị được trực tiếp
            'url'         => $this->hinh_anh
                                ? Storage::disk('public')->url($this->hinh_anh)
                                : null,
            'thu_tu'      => $this->thu_tu,
            'status'      => (bool) $this->status,
        ];
    }
}
