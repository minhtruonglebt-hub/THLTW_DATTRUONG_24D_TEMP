<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ThuongHieuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ten_thuong_hieu' => $this->isMethod('put') || $this->isMethod('patch')
                ? 'sometimes|required|string|max:255'
                : 'required|string|max:255',
            'mo_ta' => 'nullable|string',
            'status' => 'nullable|boolean',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
