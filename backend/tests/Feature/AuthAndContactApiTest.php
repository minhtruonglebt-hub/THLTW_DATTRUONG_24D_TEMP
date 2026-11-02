<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthAndContactApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_registration_authentication_and_contact_submission(): void
    {
        $username = 'test-'.Str::random(16);
        $email = Str::uuid().'@example.invalid';

        $this->postJson('/api/auth/dang-nhap', [
            'login' => $username,
            'password' => 'WrongPassword123!',
        ])->assertUnauthorized();

        $registration = $this->postJson('/api/auth/dang-ky', [
            'username' => $username,
            'ho_ten' => 'Automated test member',
            'email' => $email,
            'password' => 'RuntimePass123!',
            'password_confirmation' => 'RuntimePass123!',
        ])->assertCreated();

        $token = $registration->json('token');
        $this->assertNotEmpty($token);

        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('email', $email);

        $contactEmail = Str::uuid().'@example.invalid';
        $this->postJson('/api/lien-he', [
            'ho_ten' => 'Automated test visitor',
            'email' => $contactEmail,
            'so_dien_thoai' => '0900000000',
            'tieu_de' => 'Contact API test',
            'noi_dung' => 'Test contact delivery and persistence.',
        ])->assertCreated();

        $this->assertTrue(DB::table('lien_he')->where('email', $contactEmail)->exists());
    }
}
