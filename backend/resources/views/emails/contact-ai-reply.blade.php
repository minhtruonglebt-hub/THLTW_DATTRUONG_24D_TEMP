<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>Phản hồi liên hệ</title>
</head>
<body>
    <p>Xin chào {{ $customerName }},</p>
    <p>Cửa hàng đã nhận được câu hỏi của bạn:</p>
    <blockquote>{{ $question }}</blockquote>
    <p>{{ $reply }}</p>
    <p>Trân trọng,<br>{{ config('app.name') }}</p>
</body>
</html>
