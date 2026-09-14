<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuKho extends Model
{
    use HasFactory;

    protected $table = 'chi_tiet_phieu_kho';

    public $timestamps = false;

    protected $fillable = [
        'phieu_kho_id',
        'san_pham_id',
        'so_luong',
        'don_gia',
    ];

    protected $casts = [
        'don_gia' => 'decimal:2',
    ];

    public function phieuKho()
    {
        return $this->belongsTo(PhieuKho::class, 'phieu_kho_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
