<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DatLaiMatKhau extends Model
{
    use HasFactory;

    protected $table = 'dat_lai_mat_khau';

    public $timestamps = false;

    protected $fillable = ['nguoi_dung_id', 'token', 'thoi_han', 'da_su_dung', 'created_at'];

    protected $casts = [
        'thoi_han' => 'datetime',
        'da_su_dung' => 'boolean',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }
}
