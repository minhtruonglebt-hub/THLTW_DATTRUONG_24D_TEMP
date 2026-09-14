<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    protected $table = 'don_hang';

    protected $fillable = [
        'ma_don_hang',
        'nguoi_dung_id',
        'ho_ten',
        'so_dien_thoai',
        'dia_chi_giao_hang',
        'tong_tien',
        'phuong_thuc_thanh_toan',
        'trang_thai',
    ];

    protected $casts = [
        'tong_tien' => 'decimal:2',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_dung_id');
    }

    public function chiTietDonHangs()
    {
        return $this->hasMany(ChiTietDonHang::class, 'don_hang_id');
    }

    public function lichSuTrangThais()
    {
        return $this->hasMany(LichSuTrangThaiDonHang::class, 'don_hang_id');
    }
}
