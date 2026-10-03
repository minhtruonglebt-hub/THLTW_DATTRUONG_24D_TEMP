<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SanPhamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->route('sanPham') !== null
            || $this->isMethod('put')
            || $this->isMethod('patch');
        $required = $isUpdate ? 'sometimes|required|' : 'required|';

        return [
            'ten_san_pham' => $required.'string|max:255',
            'danh_muc_id' => $required.'integer|exists:danh_muc,id',
            'thuong_hieu_id' => $required.'integer|exists:thuong_hieu,id',
            'gia' => $required.'numeric|min:0',
            'gia_khuyen_mai' => 'nullable|numeric|min:0',
            'so_luong' => 'nullable|integer|min:0',
            'mo_ta_ngan' => 'nullable|string',
            'mo_ta' => 'nullable|string',
            'status' => 'nullable|boolean',
            'hinh_anh' => 'nullable|image|max:2048',
            'hinh_anhs.*' => 'nullable|image|max:2048',
        ];
    }
}
