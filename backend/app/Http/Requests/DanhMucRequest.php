<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DanhMucRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $danhMuc = $this->route('danhMuc');
        $danhMucId = is_object($danhMuc) ? $danhMuc->id : $danhMuc;

        return [
            'ten_danh_muc' => $this->isMethod('put') || $this->isMethod('patch')
                ? 'sometimes|required|string|max:255'
                : 'required|string|max:255',
            'mo_ta' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:danh_muc,id'.($danhMucId ? '|not_in:'.$danhMucId : ''),
            'status' => 'nullable|boolean',
        ];
    }
}
