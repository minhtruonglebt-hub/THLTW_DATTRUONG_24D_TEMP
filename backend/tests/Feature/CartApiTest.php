<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_can_add_update_and_remove_a_cart_item(): void
    {
        $product = DB::table('san_pham')
            ->where('status', 1)
            ->where('so_luong', '>', 1)
            ->first();

        $this->assertNotNull($product, 'The test database needs an active product with stock.');
        $sessionId = (string) Str::uuid();
        $headers = ['X-Session-Id' => $sessionId];

        $cart = $this->withHeaders($headers)->postJson('/api/gio-hang', [
            'san_pham_id' => $product->id,
            'so_luong' => 1,
            'session_id' => $sessionId,
        ])->assertOk();

        $detailId = $cart->json('data.chi_tiets.0.id');
        $this->assertNotNull($detailId);

        $this->withHeaders($headers)->putJson("/api/gio-hang/{$detailId}", [
            'so_luong' => 2,
            'session_id' => $sessionId,
        ])->assertOk()->assertJsonPath('data.chi_tiets.0.so_luong', 2);

        $this->withHeaders($headers)->getJson('/api/gio-hang?session_id='.$sessionId)
            ->assertOk()
            ->assertJsonPath('data.tong_so_luong', 2);

        $this->withHeaders($headers)->deleteJson("/api/gio-hang/{$detailId}?session_id={$sessionId}")
            ->assertOk()
            ->assertJsonPath('data.chi_tiets', []);
    }
}
