<?php

namespace App\Services;

use App\Models\DonHang;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Nói chuyện với cổng thanh toán MoMo (API v2, requestType = captureWallet).
 *   - taoThanhToan() : xin MoMo link + mã QR cho 1 đơn hàng
 *   - truyVan()      : hỏi MoMo "đơn này trả tiền chưa?"
 *   - kiemTraChuKy() : kiểm tra dữ liệu MoMo gửi về (IPN / redirect) có đúng là của MoMo không
 */
class MomoService
{
    /**
     * resultCode 0 = thành công. Chỉ những mã này mới chắc chắn là THẤT BẠI (khách huỷ/từ chối, hết hạn, thiếu tiền...).
     * Mọi mã khác (1000 đang chờ, 7000 đang xử lý, 42 chưa thấy giao dịch...) coi là "đang chờ" để khỏi báo lỗi oan.
     */
    private const MA_THAT_BAI = [1001, 1002, 1003, 1004, 1005, 1006, 1017, 1026, 4001, 4002, 4100];

    public function taoThanhToan(DonHang $donHang): array
    {
        $cfg = config('services.momo');

        // MoMo không cho trùng orderId => mỗi lần tạo QR mới thêm hậu tố thời gian
        $orderId = $donHang->ma_don_hang.'-'.time();
        $requestId = $orderId;
        $amount = (string) $this->soTien($donHang);
        $orderInfo = 'Thanh toan don hang '.$donHang->ma_don_hang;
        $redirectUrl = rtrim($cfg['frontend_url'], '/').'/orders/'.$donHang->id.'?ma='.$donHang->ma_don_hang;
        $ipnUrl = $cfg['ipn_url'] ?: url('/api/momo/ipn');
        $extraData = '';
        $requestType = 'captureWallet';

        $raw = "accessKey={$cfg['access_key']}&amount={$amount}&extraData={$extraData}&ipnUrl={$ipnUrl}"
            ."&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$cfg['partner_code']}"
            ."&redirectUrl={$redirectUrl}&requestId={$requestId}&requestType={$requestType}";

        $res = $this->goi('/v2/gateway/api/create', [
            'partnerCode' => $cfg['partner_code'],
            'partnerName' => config('app.name', 'Shop'),
            'storeId' => 'Shop',
            'requestId' => $requestId,
            'amount' => (int) $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'requestType' => $requestType,
            'autoCapture' => true,
            'extraData' => $extraData,
            'signature' => $this->kyTen($raw),
        ]);

        if (($res['resultCode'] ?? -1) !== 0 || empty($res['payUrl'])) {
            Log::warning('MoMo create lỗi', ['don_hang' => $donHang->ma_don_hang, 'res' => $res]);
            throw new RuntimeException($res['message'] ?? 'MoMo từ chối tạo giao dịch');
        }

        return [
            'order_id' => $orderId,
            'pay_url' => $res['payUrl'],
            // qrCodeUrl có thể trống (MoMo thật chỉ cấp khi đã đăng ký) => giao diện sẽ dùng payUrl
            'qr_code' => $res['qrCodeUrl'] ?? null,
        ];
    }

    /** @return array{trang_thai: string, ma: int, trans_id: ?string, so_tien: ?int, thong_bao: string} */
    public function truyVan(DonHang $donHang): array
    {
        $cfg = config('services.momo');
        $requestId = $donHang->momo_order_id.'-q'.time();
        $raw = "accessKey={$cfg['access_key']}&orderId={$donHang->momo_order_id}"
            ."&partnerCode={$cfg['partner_code']}&requestId={$requestId}";

        $res = $this->goi('/v2/gateway/api/query', [
            'partnerCode' => $cfg['partner_code'],
            'requestId' => $requestId,
            'orderId' => $donHang->momo_order_id,
            'lang' => 'vi',
            'signature' => $this->kyTen($raw),
        ]);

        $ma = (int) ($res['resultCode'] ?? -1);

        return [
            'trang_thai' => $ma === 0 ? 'thanh_cong' : (in_array($ma, self::MA_THAT_BAI, true) ? 'that_bai' : 'dang_cho'),
            'ma' => $ma,
            'trans_id' => isset($res['transId']) ? (string) $res['transId'] : null,
            'so_tien' => isset($res['amount']) ? (int) $res['amount'] : null,
            'thong_bao' => $res['message'] ?? '',
        ];
    }

    /** Kiểm tra chữ ký của dữ liệu MoMo gửi về (IPN). */
    public function kiemTraChuKy(array $d): bool
    {
        $cfg = config('services.momo');
        $raw = "accessKey={$cfg['access_key']}&amount=".($d['amount'] ?? '')
            .'&extraData='.($d['extraData'] ?? '')
            .'&message='.($d['message'] ?? '')
            .'&orderId='.($d['orderId'] ?? '')
            .'&orderInfo='.($d['orderInfo'] ?? '')
            .'&orderType='.($d['orderType'] ?? '')
            .'&partnerCode='.($d['partnerCode'] ?? '')
            .'&payType='.($d['payType'] ?? '')
            .'&requestId='.($d['requestId'] ?? '')
            .'&responseTime='.($d['responseTime'] ?? '')
            .'&resultCode='.($d['resultCode'] ?? '')
            .'&transId='.($d['transId'] ?? '');

        return hash_equals($this->kyTen($raw), (string) ($d['signature'] ?? ''));
    }

    /** MoMo chỉ nhận số tiền nguyên (VND). */
    public function soTien(DonHang $donHang): int
    {
        return (int) round((float) $donHang->tong_tien);
    }

    private function kyTen(string $raw): string
    {
        return hash_hmac('sha256', $raw, config('services.momo.secret_key'));
    }

    private function goi(string $path, array $body): array
    {
        try {
            $response = Http::timeout(30)->acceptJson()->asJson()
                ->post(rtrim(config('services.momo.endpoint'), '/').$path, $body);
        } catch (\Throwable $e) {
            Log::error('Không gọi được MoMo', ['path' => $path, 'error' => $e->getMessage()]);
            throw new RuntimeException('Không kết nối được MoMo, vui lòng thử lại sau');
        }

        return $response->json() ?? [];
    }
}
