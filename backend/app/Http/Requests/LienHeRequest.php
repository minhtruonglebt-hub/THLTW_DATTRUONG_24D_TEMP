<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LienHeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ho_ten' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'so_dien_thoai' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
            'tieu_de' => 'nullable|string|max:255',
            'noi_dung' => 'required|string|min:10|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'ho_ten.required' => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'so_dien_thoai.regex' => 'Số điện thoại không hợp lệ.',
            'noi_dung.required' => 'Vui lòng nhập nội dung liên hệ.',
            'noi_dung.min' => 'Nội dung liên hệ cần ít nhất 10 ký tự.',
            'noi_dung.max' => 'Nội dung liên hệ tối đa 2000 ký tự.',
        ];
    }
}
