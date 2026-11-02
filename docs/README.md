# THLTW_TANDATTRUONG_24D_TEMP

## Thanh toán bằng mã QR chuyển khoản

Trang thanh toán có lựa chọn **Chuyển khoản ngân hàng (quét mã QR)**. Sau khi đặt hàng,
trang chi tiết đơn hàng hiển thị QR có sẵn số tiền phải trả và mã đơn trong nội dung
chuyển khoản. Mỗi QR được tạo từ mã QR VietQR tĩnh của cửa hàng; không dùng thông
tin tài khoản giả định.

Để bật tính năng:

1. Sao chép `backend/.env.example` thành `backend/.env` nếu chưa có file `.env`.
2. Lấy nội dung chuỗi EMVCo/VietQR tĩnh của tài khoản cửa hàng từ ứng dụng ngân hàng,
   rồi khai báo trong `backend/.env`:

   ```dotenv
   MOMO_QR_TINH="chuỗi VietQR tĩnh của cửa hàng"
   MOMO_NHAN_TEN="Tên người nhận"
   ```

3. Khởi động lại backend hoặc chạy `php artisan config:clear` trong thư mục `backend`.
4. Đặt đơn với phương thức QR. Khách quét mã bằng ứng dụng ngân hàng hoặc MoMo rồi
   bấm **Tôi đã chuyển khoản**; cửa hàng đối chiếu giao dịch và xác nhận trong trang quản trị.

Nếu chưa cấu hình `MOMO_QR_TINH` hoặc chuỗi QR không hợp lệ, mã thanh toán sẽ không
được hiển thị. Khi đó trang đơn hàng hướng khách chọn COD hoặc liên hệ cửa hàng.