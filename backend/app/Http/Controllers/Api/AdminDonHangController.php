<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonHangResource;
use App\Models\DonHang;
use App\Models\KhuyenMai;
use App\Models\SanPham;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Quản lý đơn hàng phía admin (FUNC-ADM-ORDER-01..04)
class AdminDonHangController extends Controller
{
    // Đơn đang ở trạng thái nào thì được chuyển sang trạng thái nào
    private const CHUYEN_TRANG_THAI = [
        'cho_xac_nhan' => ['da_xac_nhan', 'da_huy'],
        'da_xac_nhan' => ['dang_giao', 'da_huy'],
        'dang_giao' => ['hoan_tat', 'da_huy'],
        'hoan_tat' => [],
        'da_huy' => [],
    ];

    // GET /api/admin/don-hang?trang_thai=&tu_ngay=&den_ngay=&keyword=&page=&per_page=
    // Không truyền per_page => trả toàn bộ (giữ tương thích với trang admin cũ)
    public function index(Request $request)
    {
        $query = DonHang::with('chiTiets.sanPham')->orderByDesc('id');

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->filled('tu_ngay')) {
            $query->whereDate('created_at', '>=', $request->tu_ngay);
        }
        if ($request->filled('den_ngay')) {
            $query->whereDate('created_at', '<=', $request->den_ngay);
        }
        if ($request->filled('keyword')) {
            $kw = '%'.$request->keyword.'%';
            $query->where(function ($q) use ($kw) {
                $q->where('ma_don_hang', 'like', $kw)
                    ->orWhere('ho_ten', 'like', $kw)
                    ->orWhere('so_dien_thoai', 'like', $kw);
            });
        }

        if ($request->filled('per_page')) {
            return DonHangResource::collection($query->paginate((int) $request->per_page)->withQueryString());
        }

        return DonHangResource::collection($query->get());
    }

    // GET /api/admin/don-hang/{donHang}
    public function show(DonHang $donHang): DonHangResource
    {
        return new DonHangResource($donHang->load(['chiTiets.sanPham', 'nguoiDung', 'lichSus.nguoiThucHien']));
    }

    // PUT /api/admin/don-hang/{donHang}/trang-thai   { trang_thai, ghi_chu? }
    public function capNhatTrangThai(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $data = $request->validate([
            'trang_thai' => 'required|in:cho_xac_nhan,da_xac_nhan,dang_giao,hoan_tat,da_huy',
            'ghi_chu' => 'nullable|string|max:500',
        ], [
            'trang_thai.required' => 'Vui lòng chọn trạng thái mới.',
            'trang_thai.in' => 'Trạng thái không hợp lệ.',
        ]);

        $cu = $donHang->trang_thai;
        $moi = $data['trang_thai'];

        if (!in_array($moi, self::CHUYEN_TRANG_THAI[$cu] ?? [], true)) {
            return response()->json(['message' => "Không thể chuyển đơn từ \"{$cu}\" sang \"{$moi}\""], 422);
        }

        DB::transaction(function () use ($request, $donHang, $cu, $moi, $data) {
            if ($moi === 'da_huy') {
                // Hủy đơn => trả hàng về kho
                foreach ($donHang->chiTiets as $ct) {
                    SanPham::where('id', $ct->san_pham_id)->increment('so_luong', $ct->so_luong);
                }
                if ($donHang->ma_khuyen_mai) {
                    KhuyenMai::where('ma_khuyen_mai', $donHang->ma_khuyen_mai)
                        ->where('da_su_dung', '>', 0)
                        ->decrement('da_su_dung');
                }
            }

            $capNhat = ['trang_thai' => $moi];
            // Giao xong đơn COD thì coi như đã thu tiền
            if ($moi === 'hoan_tat' && $donHang->phuong_thuc_thanh_toan === 'cod' && $donHang->trang_thai_thanh_toan !== 'da_thanh_toan') {
                $capNhat['trang_thai_thanh_toan'] = 'da_thanh_toan';
                $capNhat['paid_at'] = now();
            }
            $donHang->update($capNhat);

            $donHang->lichSus()->create([
                'trang_thai_cu' => $cu,
                'trang_thai_moi' => $moi,
                'ghi_chu' => $data['ghi_chu'] ?? null,
                'nguoi_thuc_hien_id' => $request->user()->id,
            ]);
        });

        return new DonHangResource($donHang->fresh(['chiTiets.sanPham', 'nguoiDung', 'lichSus.nguoiThucHien']));
    }

    // POST /api/admin/don-hang/{donHang}/huy   { ghi_chu? }
    // Admin huy đơn ở bất kỳ bước nào trước khi hoàn tất (theo yêu cầu khách hoặc khi phát hiện sai sót)
    public function huy(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $request->merge(['trang_thai' => 'da_huy']);

        return $this->capNhatTrangThai($request, $donHang);
    }
}
