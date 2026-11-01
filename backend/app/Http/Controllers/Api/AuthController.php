<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DangKyRequest;
use App\Http\Requests\CapNhatHoSoRequest;
use App\Http\Requests\DangNhapRequest;
use App\Http\Requests\DoiMatKhauRequest;
use App\Http\Requests\DatLaiMatKhauRequest;
use App\Http\Requests\YeuCauDatLaiMatKhauRequest;
use App\Models\DatLaiMatKhau;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(DangKyRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'ho_ten' => $request->ho_ten,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'so_dien_thoai' => $request->so_dien_thoai,
            'dia_chi' => $request->dia_chi,
            'vai_tro' => 'member',
            'status' => 1,
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken,
        ], 201);
    }

    public function login(DangNhapRequest $request): JsonResponse
    {
        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (!$user || !$user->status || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Thông tin đăng nhập không đúng'], 401);
        }

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // Sửa hồ sơ: họ tên, email, số điện thoại, địa chỉ (username không cho đổi)
    public function updateProfile(CapNhatHoSoRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'user' => $user->fresh(),
        ]);
    }

    // Đổi mật khẩu: phải nhập đúng mật khẩu hiện tại
    public function changePassword(DoiMatKhauRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->mat_khau_hien_tai, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng',
                'errors' => ['mat_khau_hien_tai' => ['Mật khẩu hiện tại không đúng']],
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Đăng xuất các thiết bị khác, chỉ giữ lại phiên đang dùng
        $currentId = $user->currentAccessToken()?->id;
        $otherTokens = $user->tokens();
        if ($currentId) {
            $otherTokens->where('id', '!=', $currentId);
        }
        $otherTokens->delete();

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function forgotPassword(YeuCauDatLaiMatKhauRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->where('status', 1)->first();

        if (!$user) {
            return response()->json(['message' => 'Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi']);
        }

        DatLaiMatKhau::where('nguoi_dung_id', $user->id)->where('da_su_dung', false)->update(['da_su_dung' => true]);
        $token = Str::random(64);
        DatLaiMatKhau::create([
            'nguoi_dung_id' => $user->id,
            'token' => hash('sha256', $token),
            'thoi_han' => now()->addMinutes(60),
            'da_su_dung' => false,
            'created_at' => now(),
        ]);

        // Gửi mã qua email cho chủ tài khoản (không bao giờ trả mã trong phản hồi ở môi trường thật)
        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Mã đặt lại mật khẩu của bạn: {$token}\nMã có hiệu lực 60 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.",
                fn ($m) => $m->to($user->email)->subject('Đặt lại mật khẩu')
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Không gửi được email đặt lại mật khẩu: '.$e->getMessage());
        }

        $body = ['message' => 'Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi'];

        // Chỉ khi chạy local + APP_DEBUG=true mới trả mã để tiện test bằng Postman
        if (config('app.debug') && app()->environment('local')) {
            $body['token'] = $token;
        }

        return response()->json($body);
    }

    public function resetPassword(DatLaiMatKhauRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->where('status', 1)->first();
        $reset = $user ? DatLaiMatKhau::where('nguoi_dung_id', $user->id)
            ->where('token', hash('sha256', $request->token))
            ->where('da_su_dung', false)
            ->where('thoi_han', '>', now())
            ->latest('id')
            ->first() : null;

        if (!$reset) {
            return response()->json(['message' => 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $reset->update(['da_su_dung' => true]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
    }
}
