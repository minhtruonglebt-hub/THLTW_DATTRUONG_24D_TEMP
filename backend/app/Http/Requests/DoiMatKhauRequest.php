<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DoiMatKhauRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route đã được bảo vệ bằng auth:sanctum
    }

    public function rules(): array
    {
        return [
            'mat_khau_hien_tai' => 'required|string',
            'password' => 'required|string|min:8|confirmed|different:mat_khau_hien_tai',
        ];
    }

    public function messages(): array
    {
        return [
            'mat_khau_hien_tai.required' => 'Vui lòng nhập mật khẩu hiện tại',
            'password.required' => 'Vui lòng nhập mật khẩu mới',
            'password.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự',
            'password.confirmed' => 'Nhập lại mật khẩu mới không khớp',
            'password.different' => 'Mật khẩu mới phải khác mật khẩu hiện tại',
        ];
    }
}
