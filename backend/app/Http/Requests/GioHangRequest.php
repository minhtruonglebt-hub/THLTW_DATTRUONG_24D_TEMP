<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GioHangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'san_pham_id' => 'required|integer|exists:san_pham,id',
            'so_luong' => 'required|integer|min:1',
        ];
    }
}
