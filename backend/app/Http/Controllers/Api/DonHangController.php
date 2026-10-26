<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DatHangRequest;
use App\Http\Resources\DonHangResource;
use App\Models\DonHang;
use App\Models\GioHang;
use App\Models\SanPham;
use App\Services\MomoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DonHangController extends Controller
{
    public function __construct(private MomoService $momo)
    {
    }

    public function index(Request $request)
    {
        // Các route này không nằm trong nhóm auth:sanctum nên phải chỉ rõ guard 'sanctum'
        // thì $request->user() mới nhận ra token Bearer.
        $user = $request->user('sanctum');

        $donHangs = DonHang::with('chiTiets.sanPham')
            ->when($user, fn ($q) => $q->where('nguoi_dung_id', $user->id), fn ($q) => $q->whereRaw('1 = 0'))
            ->latest('id')
            ->paginate((int) $request->input('per_page', 12));

        return DonHangResource::collection($donHangs);
    }

    public function show(Request $request, DonHang $donHang): DonHangResource
    {
        $this->kiemTraQuyenXem($request, $donHang);

        return new DonHangResource($donHang->load('chiTiets.sanPham'));
    }

    public function store(DatHangRequest $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $phuongThuc = $request->input('phuong_thuc_thanh_toan') ?: 'cod';

        $donHang = DB::transaction(function () use ($request, $user, $phuongThuc) {
            [$dong, $gioHang] = $this->layDongHang($request, $user);

            // Khoá các dòng sản phẩm để 2 người mua cùng lúc không bán lố tồn kho
            $sanPhams = SanPham::whereIn('id', array_keys($dong))->lockForUpdate()->get()->keyBy('id');

            $tongTien = 0;
            $chiTiets = [];
            foreach ($dong as $sanPhamId => $soLuong) {
                $sanPham = $sanPhams->get($sanPhamId);
                if (!$sanPham || !$sanPham->status || $soLuong > $sanPham->so_luong) {
                    abort(422, 'Sản phẩm không đủ số lượng trong kho: '.($sanPham?->ten_san_pham ?? 'không tồn tại'));
                }
                $donGia = $sanPham->giaBan();
                $tongTien += $donGia * $soLuong;
                $chiTiets[] = [$sanPham, $soLuong, $donGia];
            }

            $donHang = DonHang::create([
                'ma_don_hang' => 'DH'.now()->format('YmdHis').strtoupper(Str::random(4)),
                'nguoi_dung_id' => $user?->id,
                'ho_ten' => $request->ho_ten,
                'so_dien_thoai' => $request->so_dien_thoai,
                'dia_chi_giao_hang' => $request->dia_chi_giao_hang,
                'tong_tien' => $tongTien,
                'phuong_thuc_thanh_toan' => $phuongThuc,
                'trang_thai' => 'cho_xac_nhan',
                'trang_thai_thanh_toan' => in_array($phuongThuc, ['momo', 'momo_qr'], true) ? 'cho_thanh_toan' : 'chua_thanh_toan',
            ]);

            foreach ($chiTiets as [$sanPham, $soLuong, $donGia]) {
                $sanPham->decrement('so_luong', $soLuong);
                $donHang->chiTiets()->create([
                    'san_pham_id' => $sanPham->id,
                    'ten_san_pham' => $sanPham->ten_san_pham,
                    'so_luong' => $soLuong,
                    'don_gia' => $donGia,
                    'thanh_tien' => $donGia * $soLuong,
                ]);
            }

            $gioHang?->chiTiets()->delete();

            return $donHang;
        });

        // Tạo QR MoMo NGOÀI transaction: MoMo lỗi thì đơn vẫn còn, khách bấm "Tạo lại mã" ở trang đơn hàng
        $canhBao = null;
        if ($phuongThuc === 'momo') {
            try {
                $this->taoMaMomo($donHang);
            } catch (\Throwable $e) {
                $canhBao = $e->getMessage();
            }
        }

        $body = (new DonHangResource($donHang->fresh('chiTiets.sanPham')))->response()->getData(true);
        if ($canhBao) {
            $body['canh_bao'] = 'Chưa tạo được mã thanh toán MoMo: '.$canhBao;
        }

        return response()->json($body, 201);
    }

    public function cancel(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $this->kiemTraQuyenXem($request, $donHang);

        if ($donHang->trang_thai !== 'cho_xac_nhan') {
            return response()->json(['message' => 'Chỉ đơn chờ xác nhận mới có thể huỷ'], 422);
        }
        $laAdmin = $request->user('sanctum')?->vai_tro === 'admin';
        if (!$laAdmin && in_array($donHang->trang_thai_thanh_toan, ['da_thanh_toan', 'cho_shop_xac_nhan'], true)) {
            return response()->json(['message' => 'Đơn đã thanh toán hoặc đang chờ shop xác nhận tiền, vui lòng liên hệ shop'], 422);
        }

        DB::transaction(function () use ($donHang) {
            $donHang->update(['trang_thai' => 'da_huy']);
            // Trả hàng về kho
            foreach ($donHang->chiTiets as $ct) {
                SanPham::where('id', $ct->san_pham_id)->increment('so_luong', $ct->so_luong);
            }
        });

        return new DonHangResource($donHang->fresh('chiTiets.sanPham'));
    }

    // ===================== MOMO =====================

    /** Tạo (lại) mã QR MoMo cho đơn chưa thanh toán. */
    public function taoThanhToanMomo(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $this->kiemTraQuyenXem($request, $donHang);

        if ($loi = $this->kiemTraDuocThanhToanMomo($donHang)) {
            return response()->json(['message' => $loi], 422);
        }

        try {
            $this->taoMaMomo($donHang);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        return new DonHangResource($donHang->fresh('chiTiets.sanPham'));
    }

    /** Trang đơn hàng gọi định kỳ: hỏi MoMo xem khách trả tiền chưa. */
    public function trangThaiMomo(Request $request, DonHang $donHang): JsonResponse
    {
        $this->kiemTraQuyenXem($request, $donHang);

        $ketQua = ['trang_thai' => 'dang_cho', 'thong_bao' => ''];

        if ($donHang->phuong_thuc_thanh_toan === 'momo'
            && $donHang->trang_thai_thanh_toan !== 'da_thanh_toan'
            && $donHang->momo_order_id) {
            try {
                $q = $this->momo->truyVan($donHang);
                $this->ghiNhanKetQua($donHang, $q['trang_thai'], $q['trans_id'], $q['so_tien']);
                $ketQua = ['trang_thai' => $q['trang_thai'], 'thong_bao' => $q['thong_bao']];
            } catch (\Throwable $e) {
                $ketQua['thong_bao'] = $e->getMessage();
            }
        }

        $donHang = $donHang->fresh('chiTiets.sanPham');
        if ($donHang->trang_thai_thanh_toan === 'da_thanh_toan') {
            $ketQua['trang_thai'] = 'thanh_cong';
        }

        return response()->json([
            'ket_qua' => $ketQua,
            'data' => (new DonHangResource($donHang))->resolve(),
        ]);
    }

    /** MoMo gọi vào đây (server → server) khi khách thanh toán xong. Phải trả HTTP 204. */
    public function momoIpn(Request $request): Response
    {
        $d = $request->all();

        if (!$this->momo->kiemTraChuKy($d)) {
            Log::warning('MoMo IPN sai chữ ký', ['orderId' => $d['orderId'] ?? null]);

            return response()->noContent(400);
        }

        $donHang = DonHang::where('momo_order_id', $d['orderId'] ?? '')->first();
        if ($donHang) {
            $this->ghiNhanKetQua(
                $donHang,
                ((int) ($d['resultCode'] ?? -1)) === 0 ? 'thanh_cong' : 'that_bai',
                isset($d['transId']) ? (string) $d['transId'] : null,
                isset($d['amount']) ? (int) $d['amount'] : null
            );
        }

        return response()->noContent();
    }

    // ===================== QR MOMO CÁ NHÂN (không có cổng tự báo => shop xác nhận tay) =====================

    /** Khách bấm "Tôi đã chuyển khoản" -> đơn chuyển sang chờ shop đối chiếu tiền. */
    public function baoDaChuyenKhoan(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        $this->kiemTraQuyenXem($request, $donHang);

        if ($donHang->phuong_thuc_thanh_toan !== 'momo_qr') {
            return response()->json(['message' => 'Đơn hàng này không thanh toán bằng QR MoMo'], 422);
        }
        if ($donHang->trang_thai === 'da_huy') {
            return response()->json(['message' => 'Đơn hàng đã bị huỷ'], 422);
        }
        if ($donHang->trang_thai_thanh_toan === 'cho_thanh_toan') {
            $donHang->update(['trang_thai_thanh_toan' => 'cho_shop_xac_nhan']);
        }

        return new DonHangResource($donHang->fresh('chiTiets.sanPham'));
    }

    /** Admin xác nhận đã thấy tiền trong MoMo. */
    public function xacNhanThanhToan(Request $request, DonHang $donHang): DonHangResource|JsonResponse
    {
        if ($request->user('sanctum')?->vai_tro !== 'admin') {
            return response()->json(['message' => 'Chỉ quản trị viên mới được xác nhận thanh toán'], 403);
        }
        if ($donHang->trang_thai === 'da_huy') {
            return response()->json(['message' => 'Đơn hàng đã bị huỷ'], 422);
        }
        if ($donHang->trang_thai_thanh_toan !== 'da_thanh_toan') {
            $donHang->update(['trang_thai_thanh_toan' => 'da_thanh_toan', 'paid_at' => now()]);
        }

        return new DonHangResource($donHang->fresh('chiTiets.sanPham'));
    }

    // ===================== HÀM PHỤ =====================

    private function taoMaMomo(DonHang $donHang): void
    {
        $r = $this->momo->taoThanhToan($donHang);
        $donHang->update([
            'momo_order_id' => $r['order_id'],
            'momo_pay_url' => $r['pay_url'],
            'momo_qr_code' => $r['qr_code'],
            'trang_thai_thanh_toan' => 'cho_thanh_toan',
        ]);
    }

    private function kiemTraDuocThanhToanMomo(DonHang $donHang): ?string
    {
        if ($donHang->phuong_thuc_thanh_toan !== 'momo') {
            return 'Đơn hàng này không thanh toán bằng MoMo';
        }
        if ($donHang->trang_thai === 'da_huy') {
            return 'Đơn hàng đã bị huỷ';
        }
        if ($donHang->trang_thai_thanh_toan === 'da_thanh_toan') {
            return 'Đơn hàng đã được thanh toán';
        }

        return null;
    }

    /**
     * Ghi kết quả MoMo vào đơn. Chỉ tin là "đã trả" khi MoMo báo thành công VÀ số tiền khớp tổng đơn.
     * Gọi nhiều lần (IPN + hỏi định kỳ) vẫn an toàn.
     */
    private function ghiNhanKetQua(DonHang $donHang, string $trangThai, ?string $transId, ?int $soTien): void
    {
        if ($donHang->trang_thai_thanh_toan === 'da_thanh_toan') {
            return;
        }

        if ($trangThai === 'thanh_cong') {
            if ($soTien !== null && $soTien !== $this->momo->soTien($donHang)) {
                Log::error('MoMo trả sai số tiền', ['don_hang' => $donHang->ma_don_hang, 'momo' => $soTien]);

                return;
            }
            if ($donHang->trang_thai === 'da_huy') {
                // Khách trả tiền cho đơn đã huỷ (quét mã cũ) => vẫn ghi nhận để admin hoàn tiền
                Log::warning('Đơn đã huỷ nhưng nhận được tiền MoMo', ['don_hang' => $donHang->ma_don_hang]);
            }
            $donHang->update([
                'trang_thai_thanh_toan' => 'da_thanh_toan',
                'momo_trans_id' => $transId,
                'paid_at' => now(),
            ]);
        } elseif ($trangThai === 'that_bai') {
            $donHang->update(['trang_thai_thanh_toan' => 'that_bai']);
        }
    }

    /**
     * Lấy các dòng hàng cần đặt: [ [san_pham_id => so_luong], giỏ hàng trên server hoặc null ].
     * Ưu tiên `items` (giỏ ở localStorage); không có thì dùng giỏ hàng lưu trên server như trước.
     */
    private function layDongHang(Request $request, $user): array
    {
        if ($request->filled('items')) {
            $dong = [];
            foreach ($request->input('items') as $item) {
                $id = (int) $item['san_pham_id'];
                $dong[$id] = ($dong[$id] ?? 0) + (int) $item['so_luong'];
            }

            return [$dong, null];
        }

        $sessionId = $request->input('session_id', $request->header('X-Session-Id'));
        if (!$user && !$sessionId) {
            abort(422, 'Giỏ hàng đang trống');
        }

        $gioHang = GioHang::where($user ? 'nguoi_dung_id' : 'session_id', $user ? $user->id : $sessionId)
            ->with('chiTiets')->first();

        if (!$gioHang || $gioHang->chiTiets->isEmpty()) {
            abort(422, 'Giỏ hàng đang trống');
        }

        return [$gioHang->chiTiets->pluck('so_luong', 'san_pham_id')->map(fn ($n) => (int) $n)->all(), $gioHang];
    }

    /**
     * Đơn của thành viên: chỉ chính họ (hoặc admin) được xem.
     * Đơn của khách vãng lai: phải gửi kèm đúng ?ma_don_hang=... (id không đoán được mã này).
     */
    private function kiemTraQuyenXem(Request $request, DonHang $donHang): void
    {
        $user = $request->user('sanctum');

        if ($user && $user->vai_tro === 'admin') {
            return;
        }

        if ($donHang->nguoi_dung_id) {
            if (!$user || (int) $user->id !== (int) $donHang->nguoi_dung_id) {
                abort(403, 'Bạn không có quyền xem đơn hàng này');
            }

            return;
        }

        if (!hash_equals($donHang->ma_don_hang, (string) $request->input('ma_don_hang', ''))) {
            abort(403, 'Bạn không có quyền xem đơn hàng này');
        }
    }
}
