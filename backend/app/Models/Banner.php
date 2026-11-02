<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'banner';

    public $timestamps = false;

    protected $fillable = ['tieu_de', 'hinh_anh', 'lien_ket', 'thu_tu', 'status'];

    protected $casts = ['status' => 'boolean'];
}
