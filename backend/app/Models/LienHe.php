<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LienHe extends Model
{
    protected $table = 'lien_he';

    // trang_thai mặc định 'chua_xu_ly' do database tự điền
    protected $fillable = [
        'ho_ten',
        'email',
        'so_dien_thoai',
        'tieu_de',
        'noi_dung',
        'trang_thai',
        'phan_hoi',
    ];
}
