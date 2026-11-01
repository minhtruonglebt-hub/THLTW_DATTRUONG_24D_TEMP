<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LienHeRequest;
use App\Models\LienHe;
use Illuminate\Http\JsonResponse;

class LienHeController extends Controller
{
    // POST /api/lien-he  — khách gửi liên hệ (không cần đăng nhập)
    public function store(LienHeRequest $request): JsonResponse
    {
        LienHe::create($request->validated());

        return response()->json([
            'message' => 'Cảm ơn bạn! Chúng tôi đã nhận được liên hệ và sẽ phản hồi sớm.',
        ], 201);
    }
}
