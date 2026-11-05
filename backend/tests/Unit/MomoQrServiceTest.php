<?php

namespace Tests\Unit;

use App\Models\DonHang;
use App\Services\MomoQrService;
use Tests\TestCase;

class MomoQrServiceTest extends TestCase
{
    public function test_it_adds_the_order_amount_and_reference_to_the_qr_content(): void
    {
        config(['services.momo.qr_tinh' => $this->buildStaticQr()]);

        $order = new DonHang([
            'tong_tien' => 125000,
            'ma_don_hang' => 'DH20261102ABCD',
        ]);

        $qr = app(MomoQrService::class)->taoNoiDung($order);

        $this->assertNotNull($qr);
        $fields = $this->parseFields(substr($qr, 0, -8));
        $this->assertSame('125000', $fields['54']);
        $this->assertSame('DH20261102ABCD', $this->parseFields($fields['62'])['08']);
        $this->assertSame($this->crc16(substr($qr, 0, -4)), substr($qr, -4));
    }

    private function buildStaticQr(): string
    {
        $payload = $this->encodeFields([
            '00' => '01',
            '01' => '11',
            '52' => '0000',
            '53' => '704',
            '58' => 'VN',
            '59' => 'SHOP',
            '60' => 'HANOI',
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
            $tag = substr($payload, $offset, 2);
            $size = (int) substr($payload, $offset + 2, 2);
            $fields[$tag] = substr($payload, $offset + 4, $size);
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
