<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('don_hang', function (Blueprint $table) {
            if (!Schema::hasColumn('don_hang', 'ma_khuyen_mai')) {
                $table->string('ma_khuyen_mai', 50)->nullable();
            }
            if (!Schema::hasColumn('don_hang', 'tien_giam')) {
                $table->decimal('tien_giam', 15, 2)->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('don_hang', function (Blueprint $table) {
            if (Schema::hasColumn('don_hang', 'ma_khuyen_mai')) {
                $table->dropColumn('ma_khuyen_mai');
            }
            if (Schema::hasColumn('don_hang', 'tien_giam')) {
                $table->dropColumn('tien_giam');
            }
        });
    }
};
