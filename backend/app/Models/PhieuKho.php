<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuKho extends Model
{
    use HasFactory;

    protected $table = 'phieu_kho';

    const UPDATED_AT = null;

    protected $fillable = [
        'ma_phieu',
        'loai_phieu',
        'ghi_chu',
        'nguoi_tao_id',
    ];

    public function nguoiTao()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoi_tao_id');
    }

    public function chiTietPhieuKhos()
    {
        return $this->hasMany(ChiTietPhieuKho::class, 'phieu_kho_id');
    }
}
