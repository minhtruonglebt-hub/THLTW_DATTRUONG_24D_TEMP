<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Mặc định là SANDBOX (khoá test công khai của MoMo, không mất tiền thật).
    // Muốn chạy tiền thật: điền khoá của tài khoản MoMo Business vào file .env
    'momo' => [
        'endpoint' => env('MOMO_ENDPOINT', 'https://test-payment.momo.vn'),
        'partner_code' => env('MOMO_PARTNER_CODE', 'MOMO'),
        'access_key' => env('MOMO_ACCESS_KEY', 'F8BBA842ECF85'),
        'secret_key' => env('MOMO_SECRET_KEY', 'K951B6PE1waDMi640xX08PD3vg6EkVlz'),
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
        // IPN cần địa chỉ public (ngrok). Không có thì bỏ trống: web vẫn tự hỏi MoMo kết quả.
        'ipn_url' => env('MOMO_IPN_URL', ''),
        // --- QR chuyển khoản (MOMO_QR_TINH là tên biến cấu hình cũ) ---
        'nhan_ten' => env('MOMO_NHAN_TEN', ''),
        'nhan_sdt' => env('MOMO_NHAN_SDT', ''),
        'qr_tinh' => env('MOMO_QR_TINH', ''),
    ],

    'ai' => [
        'base_url' => env('AI_BASE_URL', 'https://api.openai.com/v1'),
        'api_key' => env('AI_API_KEY', ''),
        'model' => env('AI_MODEL', 'gpt-4o-mini'),
        'demo_mode' => env('AI_DEMO_MODE', false),
        'delivery_policy' => env('STORE_DELIVERY_POLICY', ''),
        'return_policy' => env('STORE_RETURN_POLICY', ''),
    ],

];
