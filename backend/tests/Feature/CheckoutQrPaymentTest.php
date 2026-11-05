<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CheckoutQrPaymentTest extends TestCase
{
    use DatabaseTransactions;

    public function test_checkout_requires_exactly_ten_numeric_phone_digits(): void
    {
        foreach (['123456789', '12345678901', '12345abc90'] as $phone) {
            $this->postJson('/api/don-hang', [
                'ho_ten' => 'Phone validation test',
                'so_dien_thoai' => $phone,
                'dia_chi_giao_hang' => 'Test address',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors('so_dien_thoai');
        }
    }

    public function test_guest_checkout_returns_a_dynamic_transfer_qr_for_the_order(): void
    {
        config(['services.momo.qr_tinh' => $this->buildStaticQr()]);

        $product = DB::table('san_pham')
            ->where('status', 1)
            ->where('so_luong', '>', 0)
            ->first();

        $this->assertNotNull($product, 'The test database needs an active product with stock.');

        $response = $this->postJson('/api/don-hang', [
            'ho_ten' => 'QR checkout test',
            'so_dien_thoai' => '0900000000',
            'dia_chi_giao_hang' => 'Test address',
            'phuong_thuc_thanh_toan' => 'momo_qr',
            'session_id' => 'qr-checkout-test',
            'items' => [['san_pham_id' => $product->id, 'so_luong' => 1]],
        ])->assertCreated()
            ->assertJsonPath('data.phuong_thuc_thanh_toan', 'momo_qr')
            ->assertJsonPath('data.trang_thai_thanh_toan', 'cho_thanh_toan');

        $qr = $response->json('data.thanh_toan.qr_content');
        $this->assertNotEmpty($qr, 'Checkout should return QR content for the order.');

        $fields = $this->parseFields(substr($qr, 0, -8));
        $this->assertSame('12', $fields['01']);
        $this->assertSame((string) (int) round((float) $response->json('data.tong_tien')), $fields['54']);
        $this->assertSame(
            $response->json('data.ma_don_hang'),
            $this->parseFields($fields['62'])['08'],
        );
        $this->assertSame($this->crc16(substr($qr, 0, -4)), substr($qr, -4));
    }

    private function buildStaticQr(): string
    {
        $payload = $this->encodeFields([
            '00' => '01',
            '01' => '11',
            '38' => $this->encodeFields([
                '00' => 'A000000727',
                '01' => $this->encodeFields([
                    '00' => '970000',
                    '01' => '123456789',
                ]),
            ]),
            '53' => '704',
            '58' => 'VN',
            '62' => $this->encodeFields(['07' => 'REF']),
        ]).'6304';

        return $payload.$this->crc16($payload);
    }

    private function encodeFields(array $fields): string
    {
        $payload = '';
        foreach ($fields as $tag => $value) {
            $payload .= $tag.sprintf('%02d', strlen($value)).$value;
        }

        return $payload;
    }

    private function parseFields(string $payload): array
    {
        $fields = [];
        for ($offset = 0, $length = strlen($payload); $offset < $length;) {
            $this->assertGreaterThanOrEqual(4, $length - $offset, 'QR payload contains an incomplete field.');
            $tag = substr($payload, $offset, 2);
            $size = (int) substr($payload, $offset + 2, 2);
            $value = substr($payload, $offset + 4, $size);
            $this->assertSame($size, strlen($value), 'QR payload field length does not match.');
            $fields[$tag] = $value;
            $offset += 4 + $size;
        }

        return $fields;
    }

    private function crc16(string $payload): string
    {
        $crc = 0xFFFF;
        for ($i = 0, $length = strlen($payload); $i < $length; $i++) {
            $crc ^= ord($payload[$i]) << 8;
            for ($bit = 0; $bit < 8; $bit++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return sprintf('%04X', $crc);
    }
}
