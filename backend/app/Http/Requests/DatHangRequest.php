<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DatHangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ho_ten' => 'required|string|max:255',
            'so_dien_thoai' => 'required|string|max:20',
            'dia_chi_giao_hang' => 'required|string|max:500',
            'phuong_thuc_thanh_toan' => 'nullable|string|max:50',
            'session_id' => 'nullable|string|max:255',
        ];
    }
}
