<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Mỗi lần đơn hàng đổi trạng thái sẽ ghi 1 dòng vào bảng này (FUNC-ADM-ORDER-02)
class LichSuTrangThaiDonHang extends Model
{
    protected $table = 'lich_su_trang_thai_don_hang';

    // Bảng chỉ có created_at (database tự điền), không có updated_at
    public $timestamps = false;

    protected $fillable = [
        'don_hang_id',
        'trang_thai_cu',
        'trang_thai_moi',
        'ghi_chu',
        'nguoi_thuc_hien_id',
    ];

    public function nguoiThucHien()
    {
        return $this->belongsTo(User::class, 'nguoi_thuc_hien_id');
    }
}
