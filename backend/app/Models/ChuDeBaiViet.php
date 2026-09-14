<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChuDeBaiViet extends Model
{
    use HasFactory;

    protected $table = 'chu_de_bai_viet';

    public $timestamps = false;

    protected $fillable = [
        'ten_chu_de',
        'slug',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function baiViets()
    {
        return $this->hasMany(BaiViet::class, 'chu_de_id');
    }
}
