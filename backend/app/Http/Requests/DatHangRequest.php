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
            'phuong_thuc_thanh_toan' => 'nullable|in:cod,momo,momo_qr',
            // Giỏ hàng gửi thẳng từ trình duyệt (localStorage). Giá KHÔNG gửi lên, server tự lấy từ DB.
            'items' => 'nullable|array|min:1|max:50',
            'items.*.san_pham_id' => 'required_with:items|integer|exists:san_pham,id',
            'items.*.so_luong' => 'required_with:items|integer|min:1|max:999',
            'session_id' => 'nullable|string|max:255',
            'ma_khuyen_mai' => 'nullable|string|max:50',
        ];
    }
}
