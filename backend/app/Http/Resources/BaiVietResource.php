<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BaiVietResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'tieu_de' => $this->tieu_de,
            'slug' => $this->slug,
            'hinh_anh_url' => $this->hinhAnhUrl(),
            'tom_tat' => $this->tom_tat,
            // Danh sách bài viết không tải nội dung (nhẹ hơn), chỉ trang chi tiết mới có
            'noi_dung' => $this->when(
                array_key_exists('noi_dung', $this->resource->getAttributes()),
                fn () => $this->noi_dung
            ),
            'chu_de' => $this->whenLoaded('chuDe', fn () => [
                'id' => $this->chuDe->id,
                'ten_chu_de' => $this->chuDe->ten_chu_de,
                'slug' => $this->chuDe->slug,
            ]),
            'created_at' => $this->created_at,
        ];
    }

    private function hinhAnhUrl(): ?string
    {
        if (! $this->hinh_anh) {
            return null;
        }

        // Ảnh đã là link đầy đủ thì dùng luôn, còn lại là ảnh lưu trong storage/public
        return Str::startsWith($this->hinh_anh, ['http://', 'https://'])
            ? $this->hinh_anh
            : Storage::disk('public')->url($this->hinh_anh);
    }
}
