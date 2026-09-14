<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class NguoiDung extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'nguoi_dung';

    protected $fillable = [
        'username',
        'password',
        'ho_ten',
        'email',
        'so_dien_thoai',
        'dia_chi',
        'vai_tro',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'nguoi_dung_id');
    }

    public function gioHangs()
    {
        return $this->hasMany(GioHang::class, 'nguoi_dung_id');
    }

    public function datLaiMatKhaus()
    {
        return $this->hasMany(DatLaiMatKhau::class, 'nguoi_dung_id');
    }

    public function phieuKhosTao()
    {
        return $this->hasMany(PhieuKho::class, 'nguoi_tao_id');
    }
}
