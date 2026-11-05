<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrangDon extends Model
{
    protected $table = 'trang_don';

    protected $fillable = ['tieu_de', 'slug', 'noi_dung', 'status'];

    protected $casts = ['status' => 'boolean'];
}
