<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CapNhatHoSoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route đã được bảo vệ bằng auth:sanctum
    }

    public function rules(): array
    {
        return [
            'ho_ten' => 'required|string|max:255',
            // unique nhưng bỏ qua chính người đang sửa
            'email' => ['required', 'email', 'max:255', Rule::unique('nguoi_dung', 'email')->ignore($this->user()->id)],
            'so_dien_thoai' => 'nullable|string|max:20',
            'dia_chi' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'ho_ten.required' => 'Vui lòng nhập họ tên',
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không đúng định dạng',
            'email.unique' => 'Email này đã được dùng bởi tài khoản khác',
            'so_dien_thoai.max' => 'Số điện thoại tối đa 20 ký tự',
        ];
    }
}
