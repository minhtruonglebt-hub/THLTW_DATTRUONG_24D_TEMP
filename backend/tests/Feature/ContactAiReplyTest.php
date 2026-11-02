<?php

namespace Tests\Feature;

use App\Mail\ContactAiReplyMail;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class ContactAiReplyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_contact_form_returns_and_emails_an_ai_reply(): void
    {
        config([
            'services.ai.api_key' => 'test-api-key',
            'services.ai.demo_mode' => false,
            'services.ai.delivery_policy' => 'Giao hàng trong nội thành.',
        ]);
        Http::fake([
            'api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'reply' => 'Shop có thể tư vấn sản phẩm phù hợp cho bạn.',
                            'needs_human' => false,
                        ]),
                    ],
                ]],
            ]),
        ]);
        Mail::fake();

        $email = Str::uuid().'@example.invalid';
        $response = $this->postJson('/api/lien-he', [
            'ho_ten' => 'AI contact test',
            'email' => $email,
            'tieu_de' => 'Tư vấn sản phẩm',
            'noi_dung' => 'Tôi muốn được tư vấn chọn sản phẩm phù hợp.',
        ])->assertCreated()
            ->assertJsonPath('needs_human', false)
            ->assertJsonPath('email_sent', true)
            ->assertJsonPath('ai_reply', 'Shop có thể tư vấn sản phẩm phù hợp cho bạn.');

        $contact = DB::table('lien_he')->where('email', $email)->first();
        $this->assertNotNull($contact);
        $this->assertSame('da_xu_ly', $contact->trang_thai);
        $this->assertSame($response->json('ai_reply'), $contact->phan_hoi);

        Http::assertSent(function ($request) use ($email) {
            $body = $request->data();

            return $request->hasHeader('Authorization', 'Bearer test-api-key')
                && ! str_contains(json_encode($body), $email);
        });
        Mail::assertSent(ContactAiReplyMail::class, fn ($mail) => $mail->hasTo($email));
    }

    public function test_local_demo_mode_returns_a_sample_reply_without_calling_an_ai_provider(): void
    {
        config([
            'services.ai.api_key' => '',
            'services.ai.demo_mode' => true,
        ]);
        Http::fake();
        Mail::fake();

        $email = Str::uuid().'@example.invalid';
        $this->postJson('/api/lien-he', [
            'ho_ten' => 'AI demo test',
            'email' => $email,
            'noi_dung' => 'Cửa hàng có những sản phẩm nào?',
        ])->assertCreated()
            ->assertJsonPath('reply_mode', 'demo')
            ->assertJsonPath('needs_human', false)
            ->assertJsonPath('email_sent', true)
            ->assertJsonPath('email_delivery', 'sent');

        Http::assertNothingSent();
        $contact = DB::table('lien_he')->where('email', $email)->first();
        $this->assertNotNull($contact);
        $this->assertSame('da_xu_ly', $contact->trang_thai);
        $this->assertStringContainsString('AI DEMO', $contact->phan_hoi);
        Mail::assertSent(ContactAiReplyMail::class, fn ($mail) => $mail->hasTo($email));
    }

    public function test_order_and_payment_questions_are_emailed_for_admin_follow_up_without_calling_ai(): void
    {
        config(['services.ai.api_key' => 'test-api-key']);
        Http::fake();
        Mail::fake();

        $email = Str::uuid().'@example.invalid';
        $this->postJson('/api/lien-he', [
            'ho_ten' => 'Payment contact test',
            'email' => $email,
            'noi_dung' => 'Tôi muốn hỏi về thanh toán của đơn hàng DH123456.',
        ])->assertCreated()
            ->assertJsonPath('needs_human', true)
            ->assertJsonPath('email_sent', true)
            ->assertJsonPath('ai_reply', 'Cửa hàng đã nhận được câu hỏi của bạn. Quản trị viên sẽ kiểm tra thông tin và phản hồi qua email sớm nhất.');

        $contact = DB::table('lien_he')->where('email', $email)->first();
        $this->assertNotNull($contact);
        $this->assertSame('chua_xu_ly', $contact->trang_thai);
        Http::assertNothingSent();
        Mail::assertSent(ContactAiReplyMail::class, fn ($mail) => $mail->hasTo($email));
    }

    public function test_delivery_questions_are_escalated_when_the_store_has_no_delivery_policy(): void
    {
        config([
            'services.ai.api_key' => 'test-api-key',
            'services.ai.delivery_policy' => '',
        ]);
        Http::fake();
        Mail::fake();

        $email = Str::uuid().'@example.invalid';
        $this->postJson('/api/lien-he', [
            'ho_ten' => 'Delivery contact test',
            'email' => $email,
            'noi_dung' => 'Shop tính phí giao hàng như thế nào?',
        ])->assertCreated()
            ->assertJsonPath('needs_human', true)
            ->assertJsonPath('email_sent', true);

        Http::assertNothingSent();
        $this->assertSame(
            'chua_xu_ly',
            DB::table('lien_he')->where('email', $email)->value('trang_thai'),
        );
    }

    public function test_contact_is_kept_for_admin_when_ai_is_not_configured(): void
    {
        config([
            'services.ai.api_key' => '',
            'services.ai.demo_mode' => false,
        ]);
        Http::fake();
        Mail::fake();

        $email = Str::uuid().'@example.invalid';
        $this->postJson('/api/lien-he', [
            'ho_ten' => 'AI unavailable test',
            'email' => $email,
            'noi_dung' => 'Tôi muốn hỏi về một sản phẩm của cửa hàng.',
        ])->assertCreated()
            ->assertJsonPath('ai_reply', null)
            ->assertJsonPath('needs_human', true)
            ->assertJsonPath('email_sent', false);

        $contact = DB::table('lien_he')->where('email', $email)->first();
        $this->assertNotNull($contact);
        $this->assertSame('chua_xu_ly', $contact->trang_thai);
        $this->assertNull($contact->phan_hoi);
        Http::assertNothingSent();
        Mail::assertNothingSent();
    }
}
