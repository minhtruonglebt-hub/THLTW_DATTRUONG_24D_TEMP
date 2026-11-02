<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LienHeRequest;
use App\Mail\ContactAiReplyMail;
use App\Models\LienHe;
use App\Services\ContactAiReplyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class LienHeController extends Controller
{
    // POST /api/lien-he  — khách gửi liên hệ (không cần đăng nhập)
    public function store(LienHeRequest $request): JsonResponse
    {
        $contact = LienHe::create($request->validated());
        $ai = app(ContactAiReplyService::class);
        $needsHuman = $ai->requiresAdministrator($contact->noi_dung);
        $reply = null;
        $replyMode = null;

        if ($needsHuman) {
            $reply = 'Cửa hàng đã nhận được câu hỏi của bạn. Quản trị viên sẽ kiểm tra thông tin và phản hồi qua email sớm nhất.';
            $replyMode = 'admin';
        } elseif ($ai->isDemoMode()) {
            $result = $ai->createDemoReply($contact);
            $reply = $result['reply'];
            $needsHuman = $result['needs_human'];
            $replyMode = $result['mode'];
        } elseif ($ai->isConfigured()) {
            try {
                $result = $ai->createReply($contact);
                $reply = $result['reply'];
                $needsHuman = $result['needs_human'];
                $replyMode = $result['mode'];
            } catch (Throwable $exception) {
                Log::warning('Không tạo được phản hồi AI cho liên hệ', [
                    'lien_he_id' => $contact->id,
                    'error_type' => get_class($exception),
                ]);
                $needsHuman = true;
            }
        } else {
            Log::notice('Chưa cấu hình AI_API_KEY; liên hệ cần quản trị viên phản hồi', [
                'lien_he_id' => $contact->id,
            ]);
            $needsHuman = true;
        }

        $emailSent = false;
        $emailDelivery = 'not_sent';
        if ($reply !== null) {
            $contact->update([
                'phan_hoi' => $reply,
                'trang_thai' => $needsHuman ? 'chua_xu_ly' : 'da_xu_ly',
            ]);

            try {
                Mail::to($contact->email)->send(new ContactAiReplyMail(
                    $contact->ho_ten,
                    $contact->noi_dung,
                    $reply,
                ));
                $emailSent = true;
                $emailDelivery = config('mail.default') === 'log' ? 'logged' : 'sent';
            } catch (Throwable $exception) {
                $emailDelivery = 'failed';
                Log::warning('Không gửi được email phản hồi liên hệ', [
                    'lien_he_id' => $contact->id,
                    'error_type' => get_class($exception),
                ]);
            }
        }

        return response()->json([
            'message' => $reply
                ? 'Đã có phản hồi cho liên hệ của bạn.'
                : 'Cửa hàng đã nhận được liên hệ. Quản trị viên sẽ phản hồi qua email sớm nhất.',
            'ai_reply' => $reply,
            'reply_mode' => $replyMode,
            'needs_human' => $needsHuman,
            'email_sent' => $emailSent,
            'email_delivery' => $emailDelivery,
        ], 201);
    }
}
