<?php

namespace App\Http\Resources;

use App\Services\MomoQrService;
use Illuminate\Http\Resources\Json\JsonResource;

class DonHangResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'ma_don_hang' => $this->ma_don_hang,
            'nguoi_dung_id' => $this->nguoi_dung_id,
            'ho_ten' => $this->ho_ten,
            'so_dien_thoai' => $this->so_dien_thoai,
            'dia_chi_giao_hang' => $this->dia_chi_giao_hang,
            'tong_tien' => $this->tong_tien,
            'ma_khuyen_mai' => $this->ma_khuyen_mai,
            'tien_giam' => $this->tien_giam ?? 0,
            'phuong_thuc_thanh_toan' => $this->phuong_thuc_thanh_toan,
            'trang_thai' => $this->trang_thai,
            'trang_thai_thanh_toan' => $this->trang_thai_thanh_toan,
            'paid_at' => $this->paid_at,
            // Thông tin để khách thanh toán (null khi không cần: COD / đã trả / đã huỷ)
            'thanh_toan' => $this->thongTinThanhToan(),
            'chi_tiets' => ChiTietDonHangResource::collection($this->whenLoaded('chiTiets')),
            'nguoi_dung' => $this->whenLoaded('nguoiDung', fn () => $this->nguoiDung ? [
                'id' => $this->nguoiDung->id,
                'username' => $this->nguoiDung->username,
                'ho_ten' => $this->nguoiDung->ho_ten,
                'email' => $this->nguoiDung->email,
            ] : null),
            'lich_su' => $this->whenLoaded('lichSus', fn () => $this->lichSus->map(fn ($l) => [
                'id' => $l->id,
                'trang_thai_cu' => $l->trang_thai_cu,
                'trang_thai_moi' => $l->trang_thai_moi,
                'ghi_chu' => $l->ghi_chu,
                'nguoi_thuc_hien' => $l->nguoiThucHien?->ho_ten,
                'created_at' => $l->created_at,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function thongTinThanhToan(): ?array
    {
        if ($this->trang_thai_thanh_toan === 'da_thanh_toan' || $this->trang_thai === 'da_huy') {
            return null;
        }

        if ($this->phuong_thuc_thanh_toan === 'momo') {
            return ['loai' => 'cong', 'pay_url' => $this->momo_pay_url, 'qr_code' => $this->momo_qr_code];
        }

        if ($this->phuong_thuc_thanh_toan === 'momo_qr') {
            return [
                'loai' => 'qr',
                'qr_content' => app(MomoQrService::class)->taoNoiDung($this->resource), // null nếu shop chưa cấu hình QR
                'so_tien' => (int) round((float) $this->tong_tien),
                'noi_dung' => $this->ma_don_hang,
                'ten' => config('services.momo.nhan_ten'),
                'sdt' => config('services.momo.nhan_sdt'),
            ];
        }

        return null;
    }
}
