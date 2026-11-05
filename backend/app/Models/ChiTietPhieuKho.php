<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuKho extends Model
{
    protected $table = 'chi_tiet_phieu_kho';

    public $timestamps = false;

    protected $fillable = ['phieu_kho_id', 'san_pham_id', 'so_luong', 'don_gia'];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
