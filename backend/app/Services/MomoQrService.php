<?php

namespace App\Services;

use App\Models\DonHang;
use Illuminate\Support\Facades\Log;

/**
 * Tạo mã QR nhận tiền MoMo CÁ NHÂN có sẵn số tiền + mã đơn hàng.
 *
 * Cách làm: lấy chuỗi của mã "QR nhận tiền" tĩnh trong app MoMo của shop (đặt ở .env: MOMO_QR_TINH),
 * rồi với mỗi đơn hàng thì:
 *   - đổi loại QR từ tĩnh (11) sang động (12)
 *   - thêm số tiền (tag 54)
 *   - ghi mã đơn vào nội dung chuyển khoản (tag 62 -> 08)
 *   - tính lại mã kiểm tra CRC (tag 63)
 * Chuỗi trả về dùng được để vẽ QR; MoMo và app ngân hàng quét là tự điền số tiền + nội dung.
 */
class MomoQrService
{
    public function daCauHinh(): bool
    {
        return $this->taoChuoi(1000, 'TEST') !== null;
    }

    public function taoNoiDung(DonHang $donHang): ?string
    {
        return $this->taoChuoi((int) round((float) $donHang->tong_tien), $donHang->ma_don_hang);
    }

    public function taoChuoi(int $soTien, string $noiDung): ?string
    {
        $goc = preg_replace('/\s+/', '', (string) config('services.momo.qr_tinh'));
        if ($goc === '' || $soTien < 1) {
            return null;
        }

        // Chuỗi copy thiếu/sai ký tự thì CRC không khớp => báo lỗi sớm thay vì cho khách quét mã hỏng
        if (strlen($goc) < 12 || substr($goc, -8, 4) !== '6304' || strtoupper(substr($goc, -4)) !== $this->crc16(substr($goc, 0, -4))) {
            Log::error('MOMO_QR_TINH không hợp lệ (sai CRC hoặc bị cắt mất ký tự)');

            return null;
        }

        $truong = $this->tach(substr($goc, 0, -8)); // bỏ 6304 + 4 ký tự CRC ở cuối
        if ($truong === null) {
            Log::error('MOMO_QR_TINH không đọc được cấu trúc');

            return null;
        }

        $moi = [];
        $phu = [];
        foreach ($truong as [$tag, $giaTri]) {
            if ($tag === '54') {
                continue; // bỏ số tiền cũ (nếu có)
            }
            if ($tag === '62') {
                $phu = $this->tach($giaTri) ?? [];
                continue;
            }
            $moi[] = [$tag, $tag === '01' ? '12' : $giaTri];
        }

        // Nội dung chuyển khoản: tối đa 25 ký tự, chỉ chữ/số
        $noiDung = substr(preg_replace('/[^A-Za-z0-9]/', '', $noiDung), 0, 25);
        $phu = array_values(array_filter($phu, fn ($p) => $p[0] !== '08'));
        $phu[] = ['08', $noiDung];
        usort($phu, fn ($a, $b) => strcmp($a[0], $b[0]));

        $moi[] = ['54', (string) $soTien];
        $moi[] = ['62', $this->ghep($phu)];
        usort($moi, fn ($a, $b) => strcmp($a[0], $b[0]));

        $noiDungQr = $this->ghep($moi).'6304';

        return $noiDungQr.$this->crc16($noiDungQr);
    }

    /** "00020101..." -> [['00','01'], ['01','12'], ...]; sai cấu trúc thì trả null */
    private function tach(string $s): ?array
    {
        $kq = [];
        $i = 0;
        $n = strlen($s);
        while ($i < $n) {
            if ($i + 4 > $n || !ctype_digit(substr($s, $i, 4))) {
                return null;
            }
            $tag = substr($s, $i, 2);
            $dai = (int) substr($s, $i + 2, 2);
            $giaTri = substr($s, $i + 4, $dai);
            if (strlen($giaTri) !== $dai) {
                return null;
            }
            $kq[] = [$tag, $giaTri];
            $i += 4 + $dai;
        }

        return $kq;
    }

    private function ghep(array $truong): string
    {
        return implode('', array_map(fn ($t) => $t[0].sprintf('%02d', strlen($t[1])).$t[1], $truong));
    }

    /** CRC-16/CCITT-FALSE (chuẩn EMVCo / VietQR), trả về 4 ký tự HEX in hoa */
    private function crc16(string $s): string
    {
        $crc = 0xFFFF;
        for ($i = 0, $n = strlen($s); $i < $n; $i++) {
            $crc ^= ord($s[$i]) << 8;
            for ($b = 0; $b < 8; $b++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return sprintf('%04X', $crc);
    }
}
