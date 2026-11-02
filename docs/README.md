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

## AI trả lời tự động cho form liên hệ

Form `/contact` lưu tin nhắn trong trang quản trị và có thể trả lời tự động bằng API
tương thích OpenAI Chat Completions. Cần cấu hình riêng trong `backend/.env`:

```dotenv
AI_API_KEY="API key của nhà cung cấp AI"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
STORE_DELIVERY_POLICY="Chính sách giao hàng chính thức của cửa hàng"
STORE_RETURN_POLICY="Chính sách đổi trả chính thức của cửa hàng"
```

Chỉ điền chính sách chính xác của cửa hàng. Để trống chính sách giao hàng/đổi trả thì
AI sẽ chuyển câu hỏi liên quan cho quản trị viên. Câu hỏi về đơn cụ thể, thanh toán,
chuyển khoản hoặc hoàn tiền luôn được chuyển quản trị viên và không gửi sang nhà cung
cấp AI. Với câu hỏi AI không chắc chắn, liên hệ vẫn ở trạng thái **Chưa xử lý** để
quản trị viên theo dõi. Tin nhắn khách (không gồm email, tên hoặc điện thoại) cùng
danh mục sản phẩm được gửi tới nhà cung cấp AI đã cấu hình.

Để gửi bản sao câu trả lời cho khách qua email, thay cấu hình Mailpit mặc định bằng
SMTP thật trong `backend/.env` (`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`). Sau khi
đổi cấu hình, chạy `php artisan config:clear` trong thư mục `backend` và khởi động
lại backend. Nếu chưa có API key hoặc SMTP lỗi, liên hệ vẫn được lưu và quản trị
viên có thể tiếp tục trả lời trong `/admin/contacts`.

### Thử ngay trên máy local (không cần API key)

Trong `backend/.env`, bật chế độ mô phỏng và ghi email vào log thay vì gửi thư thật:

```dotenv
AI_DEMO_MODE=true
MAIL_MAILER=log
MAIL_FROM_ADDRESS="no-reply@local.test"
MAIL_FROM_NAME="Cua hang - che do thu"
```

Sau đó chạy `php artisan config:clear`, khởi động lại backend, mở
`http://localhost:3000/contact` và gửi câu hỏi **"Cửa hàng có những sản phẩm nào?"**.
Trang sẽ ghi rõ đây là **AI DEMO**; câu trả lời dùng danh mục và giá trong cơ sở dữ liệu,
không gọi nhà cung cấp AI. Email thử được ghi ở `backend/logs/laravel.log`, không gửi tới
hộp thư. Thử hỏi về thanh toán/đơn hàng để xác nhận trường hợp này được chuyển quản trị viên.
Chỉ bật `AI_DEMO_MODE` trong môi trường local/testing; chế độ production bỏ qua cờ demo.