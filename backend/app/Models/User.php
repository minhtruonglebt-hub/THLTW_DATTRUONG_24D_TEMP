<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'nguoi_dung';

    protected $fillable = [
        'username',
        'ho_ten',
        'email',
        'password',
        'so_dien_thoai',
        'dia_chi',
        'vai_tro',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function gioHang()
    {
        return $this->hasOne(GioHang::class, 'nguoi_dung_id');
    }

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'nguoi_dung_id');
    }
}
