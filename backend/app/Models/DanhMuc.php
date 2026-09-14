<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhMuc extends Model
{
    use HasFactory;

    protected $table = 'danh_muc';

    protected $fillable = [
        'ten_danh_muc',
        'slug',
        'mo_ta',
        'parent_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(DanhMuc::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DanhMuc::class, 'parent_id');
    }

    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'danh_muc_id');
    }

    // Scope: DanhMuc::active() -> lọc status = 1
    public function scopeActive($query)
    {
        $query->where('status', 1);
    }
}
