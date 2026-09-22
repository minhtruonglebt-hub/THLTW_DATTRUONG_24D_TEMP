<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HinhAnhSanPhamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hinh_anhs' => 'required|array|min:1',
            'hinh_anhs.*' => 'image|max:2048',
        ];
    }
}
