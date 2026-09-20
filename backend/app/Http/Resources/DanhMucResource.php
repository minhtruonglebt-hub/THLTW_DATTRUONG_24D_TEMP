<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DanhMucResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'ten_danh_muc' => $this->ten_danh_muc,
            'slug'         => $this->slug,
            'mo_ta'        => $this->mo_ta,
            'parent_id'    => $this->parent_id,
            'status'       => (bool) $this->status,
            'children'     => DanhMucResource::collection(
                                  $this->whenLoaded('children')),
        ];
    }
}
