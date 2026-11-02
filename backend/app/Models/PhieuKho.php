<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuKho extends Model
{
    protected $table = 'phieu_kho';

    public const UPDATED_AT = null;

    protected $fillable = ['ma_phieu', 'loai_phieu', 'ghi_chu', 'nguoi_tao_id'];

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuKho::class, 'phieu_kho_id');
    }

    public function nguoiTao()
    {
        return $this->belongsTo(User::class, 'nguoi_tao_id');
    }
}
