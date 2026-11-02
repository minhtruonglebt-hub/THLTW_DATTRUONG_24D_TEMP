<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LienHe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Quản lý liên hệ phía admin (FUNC-ADM-CONTACT-01..03)
class AdminLienHeController extends Controller
{
    // GET /api/admin/lien-he?trang_thai=chua_xu_ly|da_xu_ly&keyword=&per_page=
    public function index(Request $request)
    {
        $query = LienHe::query()->orderByDesc('id');

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->filled('keyword')) {
            $kw = '%'.$request->keyword.'%';
            $query->where(function ($q) use ($kw) {
                $q->where('ho_ten', 'like', $kw)
                    ->orWhere('email', 'like', $kw)
                    ->orWhere('tieu_de', 'like', $kw);
            });
        }

        if ($request->filled('per_page')) {
            return $query->paginate((int) $request->per_page)->withQueryString();
        }

        return response()->json(['data' => $query->get()]);
    }

    public function show(LienHe $lienHe): JsonResponse
    {
        return response()->json(['data' => $lienHe]);
    }

    // PUT /api/admin/lien-he/{lienHe}   { trang_thai, phan_hoi? }
    public function update(Request $request, LienHe $lienHe): JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|in:chua_xu_ly,da_xu_ly',
            'phan_hoi' => 'nullable|string|max:2000',
        ], [
            'trang_thai.required' => 'Vui lòng chọn trạng thái xử lý.',
            'trang_thai.in' => 'Trạng thái không hợp lệ.',
        ]);

        $lienHe->update($data);

        return response()->json(['message' => 'Đã cập nhật liên hệ', 'data' => $lienHe->fresh()]);
    }

    public function destroy(LienHe $lienHe): JsonResponse
    {
        if ($lienHe->trang_thai !== 'da_xu_ly') {
            return response()->json(['message' => 'Chỉ được xóa liên hệ đã xử lý xong'], 422);
        }

        $lienHe->delete();

        return response()->json(['message' => 'Đã xóa liên hệ']);
    }
}
