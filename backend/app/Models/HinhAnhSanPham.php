<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HinhAnhSanPham extends Model
{
    use HasFactory;

    protected $table = 'hinh_anh_san_pham';

    public $timestamps = false;

    protected $fillable = [
        'san_pham_id',
        'hinh_anh',
        'thu_tu',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }
}
