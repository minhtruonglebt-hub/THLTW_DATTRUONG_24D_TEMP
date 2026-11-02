<?php

namespace Tests\Feature;

use App\Models\LienHe;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminContactApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_filter_review_update_and_delete_contacts(): void
    {
        $contact = LienHe::create([
            'ho_ten' => 'Automated contact visitor',
            'email' => Str::uuid().'@example.invalid',
            'tieu_de' => 'Admin contact workflow '.Str::uuid(),
            'noi_dung' => 'Please review this test contact.',
            'trang_thai' => 'chua_xu_ly',
        ]);

        $this->getJson('/api/admin/lien-he')->assertUnauthorized();

        $admin = User::create([
            'username' => 'test-'.Str::random(16),
            'ho_ten' => 'Automated test admin',
            'email' => Str::uuid().'@example.invalid',
            'password' => Hash::make(Str::random(32)),
            'vai_tro' => 'admin',
            'status' => true,
        ]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/lien-he?trang_thai=chua_xu_ly&keyword=Automated+contact&per_page=5')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $contact->id);

        $this->getJson("/api/admin/lien-he/{$contact->id}")
            ->assertOk()
            ->assertJsonPath('data.email', $contact->email);

        $this->putJson("/api/admin/lien-he/{$contact->id}", [
            'trang_thai' => 'da_xu_ly',
            'phan_hoi' => 'Đã tiếp nhận và phản hồi.',
        ])->assertOk()
            ->assertJsonPath('data.trang_thai', 'da_xu_ly')
            ->assertJsonPath('data.phan_hoi', 'Đã tiếp nhận và phản hồi.');

        $pendingContact = LienHe::create([
            'ho_ten' => 'Pending test visitor',
            'email' => Str::uuid().'@example.invalid',
            'tieu_de' => 'Pending contact',
            'noi_dung' => 'This contact must not be deleted before review.',
            'trang_thai' => 'chua_xu_ly',
        ]);
        $this->deleteJson("/api/admin/lien-he/{$pendingContact->id}")
            ->assertUnprocessable();
        $this->assertDatabaseHas('lien_he', ['id' => $pendingContact->id]);

        $this->deleteJson("/api/admin/lien-he/{$contact->id}")
            ->assertOk();
        $this->assertDatabaseMissing('lien_he', ['id' => $contact->id]);
    }
}
