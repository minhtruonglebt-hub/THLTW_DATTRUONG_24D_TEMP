<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LichSuTrangThaiDonHang extends Model
{
    use HasFactory;

    protected $table = 'lich_su_trang_thai_don_hang';

    const UPDATED_AT = null;

    protected $fillable = [
        'don_hang_id',
        'trang_thai_cu',
        'trang_thai_moi',
        'ghi_chu',
        'nguoi_thuc_hien_id',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }

    public function nguoiThucHien()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_thuc_hien_id');
    }
}
