<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonHangResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Quản lý thành viên phía admin (FUNC-ADM-MEM-01..04)
class AdminNguoiDungController extends Controller
{
    // GET /api/admin/nguoi-dung?keyword=&status=&per_page=
    public function index(Request $request)
    {
        $query = User::query()->orderBy('id');

        if ($request->filled('keyword')) {
            $kw = '%'.$request->keyword.'%';
            $query->where(function ($q) use ($kw) {
                $q->where('ho_ten', 'like', $kw)
                    ->orWhere('email', 'like', $kw)
                    ->orWhere('username', 'like', $kw)
                    ->orWhere('so_dien_thoai', 'like', $kw);
            });
        }
        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('per_page')) {
            return $query->paginate((int) $request->per_page)->withQueryString();
        }

        return response()->json(['data' => $query->get()]);
    }

    // GET /api/admin/nguoi-dung/{user}  — thông tin cá nhân + lịch sử đơn hàng
    public function show(User $user): JsonResponse
    {
        $donHangs = $user->donHangs()->with('chiTiets.sanPham')->latest('id')->get();

        return response()->json([
            'data' => $user,
            'don_hangs' => DonHangResource::collection($donHangs)->resolve(),
        ]);
    }

    // POST /api/admin/nguoi-dung/{user}/khoa   { status: true|false }   (true = mở khóa, false = khóa)
    public function khoa(Request $request, User $user): JsonResponse
    {
        $request->validate(['status' => 'required|boolean']);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Bạn không thể tự khóa tài khoản của mình'], 422);
        }
        if ($user->vai_tro === 'admin') {
            return response()->json(['message' => 'Không thể khóa tài khoản quản trị viên'], 422);
        }

        $user->update(['status' => $request->boolean('status')]);

        // Khóa thì đăng xuất mọi phiên đang đăng nhập của người đó
        if (!$user->status) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->status ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
            'data' => $user->fresh(),
        ]);
    }

    // DELETE /api/admin/nguoi-dung/{user}
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Bạn không thể tự xóa tài khoản của mình'], 422);
        }
        if ($user->vai_tro === 'admin') {
            return response()->json(['message' => 'Không thể xóa tài khoản quản trị viên'], 422);
        }
        // Bảng don_hang tham chiếu nguoi_dung nên đã có đơn thì chỉ nên khóa, không xóa
        if ($user->donHangs()->exists()) {
            return response()->json(['message' => 'Thành viên đã có đơn hàng, không thể xóa. Hãy khóa tài khoản thay thế.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Đã xóa thành viên']);
    }
}
