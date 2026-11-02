<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CauHinhWebsite extends Model
{
    protected $table = 'cau_hinh_website';

    protected $fillable = [
        'ten_website',
        'logo',
        'favicon',
        'hotline',
        'email',
        'dia_chi',
        'facebook',
        'instagram',
        'youtube',
        'seo_title',
        'seo_description',
    ];
}
