<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SanPham extends Model
{
    use HasFactory;

    protected $table = 'san_pham';

    protected $fillable = [
        'ten_san_pham',
        'slug',
        'danh_muc_id',
        'thuong_hieu_id',
        'gia',
        'gia_khuyen_mai',
        'so_luong',
        'hinh_anh',
        'mo_ta_ngan',
        'mo_ta',
        'luot_xem',
        'status',
    ];

    protected $casts = [
        'gia' => 'decimal:2',
        'gia_khuyen_mai' => 'decimal:2',
        'status' => 'boolean',
    ];

    public function danhMuc()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_id');
    }

    public function thuongHieu()
    {
        return $this->belongsTo(ThuongHieu::class, 'thuong_hieu_id');
    }

    public function hinhAnhs()
    {
        return $this->hasMany(HinhAnhSanPham::class, 'san_pham_id');
    }

    public function chiTietDonHangs()
    {
        return $this->hasMany(ChiTietDonHang::class, 'san_pham_id');
    }

    public function chiTietGioHangs()
    {
        return $this->hasMany(ChiTietGioHang::class, 'san_pham_id');
    }

    public function chiTietPhieuKhos()
    {
        return $this->hasMany(ChiTietPhieuKho::class, 'san_pham_id');
    }
}
