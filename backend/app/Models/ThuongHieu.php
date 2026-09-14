<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThuongHieu extends Model
{
    use HasFactory;

    protected $table = 'thuong_hieu';

    protected $fillable = [
        'ten_thuong_hieu',
        'slug',
        'mo_ta',
        'logo',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'thuong_hieu_id');
    }
}
