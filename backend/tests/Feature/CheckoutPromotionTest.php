<?php

namespace Tests\Feature;

use App\Models\KhuyenMai;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutPromotionTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_order_applies_promotion_and_cancellation_restores_stock_and_usage(): void
    {
        $product = DB::table('san_pham')
            ->where('status', 1)
            ->where('so_luong', '>', 0)
            ->first();

        $this->assertNotNull($product, 'The test database needs an active product with stock.');

        $originalPrice = (float) $product->gia;
        $salePrice = (float) $product->gia_khuyen_mai;
        $price = $salePrice > 0 && $salePrice < $originalPrice ? $salePrice : $originalPrice;
        $stockBefore = (int) $product->so_luong;
        $code = 'TEST'.strtoupper(Str::random(12));
        $sessionId = (string) Str::uuid();

        $promotion = KhuyenMai::create([
            'ma_khuyen_mai' => $code,
            'ten_khuyen_mai' => 'Automated checkout test',
            'loai_giam' => 'phan_tram',
            'gia_tri_giam' => 10,
            'don_toi_thieu' => 0,
            'so_lan_su_dung' => 5,
            'da_su_dung' => 0,
            'ngay_bat_dau' => now()->subDay(),
            'ngay_ket_thuc' => now()->addDay(),
            'status' => true,
        ]);

        $this->postJson('/api/don-hang', [
            'ho_ten' => 'Automated test',
            'so_dien_thoai' => '0900000000',
            'dia_chi_giao_hang' => 'Test address',
            'phuong_thuc_thanh_toan' => 'cod',
            'ma_khuyen_mai' => $code,
            'session_id' => $sessionId,
            'items' => [['san_pham_id' => $product->id, 'so_luong' => 1]],
        ])->assertCreated()
            ->assertJsonPath('data.ma_khuyen_mai', $code)
            ->assertJsonPath('data.tien_giam', number_format($price * 0.1, 2, '.', ''));

        $order = DB::table('don_hang')->where('ma_khuyen_mai', $code)->first();
        $this->assertNotNull($order);
        $this->assertSame($stockBefore - 1, (int) DB::table('san_pham')->where('id', $product->id)->value('so_luong'));
        $this->assertSame(1, (int) $promotion->fresh()->da_su_dung);

        $this->postJson("/api/don-hang/{$order->id}/huy", ['ma_don_hang' => $order->ma_don_hang])
            ->assertOk()
            ->assertJsonPath('data.trang_thai', 'da_huy');

        $this->assertSame($stockBefore, (int) DB::table('san_pham')->where('id', $product->id)->value('so_luong'));
        $this->assertSame(0, (int) $promotion->fresh()->da_su_dung);
    }
}
