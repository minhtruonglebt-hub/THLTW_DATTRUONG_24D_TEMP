<?php

namespace App\Services;

use App\Models\KhuyenMai;
use Illuminate\Validation\ValidationException;

class KhuyenMaiService
{
    public function tinh(string $ma, float $tamTinh, bool $lock = false): array
    {
        $query = KhuyenMai::where('ma_khuyen_mai', strtoupper(trim($ma)));
        if ($lock) {
            $query->lockForUpdate();
        }

        $khuyenMai = $query->first();
        $now = now();

        if (
            !$khuyenMai
            || !$khuyenMai->status
            || $now->lt($khuyenMai->ngay_bat_dau)
            || $now->gt($khuyenMai->ngay_ket_thuc)
            || ($khuyenMai->so_lan_su_dung !== null && $khuyenMai->da_su_dung >= $khuyenMai->so_lan_su_dung)
        ) {
            throw ValidationException::withMessages(['ma_khuyen_mai' => ['Mã khuyến mãi không hợp lệ, đã hết hạn hoặc hết lượt sử dụng.']]);
        }

        if ($tamTinh < (float) $khuyenMai->don_toi_thieu) {
            throw ValidationException::withMessages([
                'ma_khuyen_mai' => ['Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này.'],
            ]);
        }

        $giam = $khuyenMai->loai_giam === 'phan_tram'
            ? $tamTinh * (float) $khuyenMai->gia_tri_giam / 100
            : (float) $khuyenMai->gia_tri_giam;
        $giam = min($tamTinh, max(0, $giam));

        return ['khuyen_mai' => $khuyenMai, 'tien_giam' => round($giam, 2)];
    }
}
