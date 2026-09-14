<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banner';

    const UPDATED_AT = null;

    protected $fillable = [
        'tieu_de',
        'hinh_anh',
        'lien_ket',
        'thu_tu',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];
}
