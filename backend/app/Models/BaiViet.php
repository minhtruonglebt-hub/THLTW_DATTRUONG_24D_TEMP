<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaiViet extends Model
{
    protected $table = 'bai_viet';

    protected $fillable = [
        'chu_de_id',
        'tieu_de',
        'slug',
        'hinh_anh',
        'tom_tat',
        'noi_dung',
        'status',
    ];

    protected $casts = ['status' => 'boolean'];

    public function chuDe()
    {
        return $this->belongsTo(ChuDeBaiViet::class, 'chu_de_id');
    }

    // BaiViet::active() -> chỉ lấy bài đang hiển thị (status = 1)
    public function scopeActive($query)
    {
        $query->where('status', 1);
    }
}
