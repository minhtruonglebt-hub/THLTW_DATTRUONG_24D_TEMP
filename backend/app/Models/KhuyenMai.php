<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhuyenMai extends Model
{
    protected $table = 'khuyen_mai';

    public $timestamps = false;

    protected $fillable = [
        'ma_khuyen_mai',
        'ten_khuyen_mai',
        'loai_giam',
        'gia_tri_giam',
        'don_toi_thieu',
        'so_lan_su_dung',
        'da_su_dung',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'status',
    ];

    protected $casts = [
        'gia_tri_giam' => 'decimal:2',
        'don_toi_thieu' => 'decimal:2',
        'ngay_bat_dau' => 'datetime',
        'ngay_ket_thuc' => 'datetime',
        'status' => 'boolean',
    ];
}
