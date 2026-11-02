<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MucMenu extends Model
{
    protected $table = 'muc_menu';

    protected $fillable = ['ten_menu', 'url', 'parent_id', 'thu_tu', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('thu_tu');
    }
}
