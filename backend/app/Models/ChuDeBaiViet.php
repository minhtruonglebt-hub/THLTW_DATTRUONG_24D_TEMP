<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChuDeBaiViet extends Model
{
    protected $table = 'chu_de_bai_viet';

    // Bảng này không có created_at / updated_at
    public $timestamps = false;

    protected $fillable = ['ten_chu_de', 'slug', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function baiViets()
    {
        return $this->hasMany(BaiViet::class, 'chu_de_id');
    }

    public function scopeActive($query)
    {
        $query->where('status', 1);
    }
}
