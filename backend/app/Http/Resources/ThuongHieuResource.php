<?php
class ThuongHieuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'ten_thuong_hieu' => $this->ten_thuong_hieu,
            'slug'        => $this->slug,
            'mo_ta' => $this->mo_ta,
            'logo'        => $this->logo,
            'status'      => $this->status,

        ];
    }
}
