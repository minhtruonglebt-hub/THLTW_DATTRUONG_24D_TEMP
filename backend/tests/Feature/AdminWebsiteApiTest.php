<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminWebsiteApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_create_a_static_page_and_record_an_inventory_receipt(): void
    {
        $admin = User::create([
            'username' => 'test-'.Str::random(16),
            'ho_ten' => 'Automated test admin',
            'email' => Str::uuid().'@example.invalid',
            'password' => Hash::make(Str::random(32)),
            'vai_tro' => 'admin',
            'status' => true,
        ]);
        Sanctum::actingAs($admin);

        $product = DB::table('san_pham')
            ->where('status', 1)
            ->where('so_luong', '>', 0)
            ->first();

        $this->assertNotNull($product, 'The test database needs an active product with stock.');
        $stockBefore = (int) $product->so_luong;

        $page = $this->postJson('/api/admin/trang-don', [
            'tieu_de' => 'Automated test '.Str::uuid(),
            'noi_dung' => 'Public static page content.',
            'status' => true,
        ])->assertCreated();

        $slug = $page->json('data.slug');
        $this->assertNotEmpty($slug);
        $this->getJson("/api/trang-don/{$slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $slug)
            ->assertJsonPath('data.noi_dung', 'Public static page content.');

        $this->postJson('/api/admin/phieu-kho', [
            'loai_phieu' => 'nhap',
            'ghi_chu' => 'Automated inventory test',
            'items' => [['san_pham_id' => $product->id, 'so_luong' => 1, 'don_gia' => 1000]],
        ])->assertCreated();

        $this->assertSame($stockBefore + 1, (int) DB::table('san_pham')->where('id', $product->id)->value('so_luong'));

        $this->postJson('/api/admin/phieu-kho', [
            'loai_phieu' => 'xuat',
            'items' => [['san_pham_id' => $product->id, 'so_luong' => $stockBefore + 5]],
        ])->assertUnprocessable();
    }
}
