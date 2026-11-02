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
        'trang_thai_thanh_toan',
        'momo_order_id',
        'momo_trans_id',
        'momo_pay_url',
        'momo_qr_code',
        'paid_at',
        'ma_khuyen_mai',
        'tien_giam',
    ];

    protected $casts = ['tong_tien' => 'decimal:2', 'tien_giam' => 'decimal:2', 'paid_at' => 'datetime'];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietDonHang::class, 'don_hang_id');
    }

    public function lichSus()
    {
        return $this->hasMany(LichSuTrangThaiDonHang::class, 'don_hang_id')->orderBy('id');
    }
}
