# Website thương mại điện tử THLTW

Website bán hàng gồm giao diện cửa hàng viết bằng **Next.js** và API/quản trị viết bằng **Laravel**, sử dụng **MySQL/MariaDB**. Tài liệu này hướng dẫn cài dự án trên máy Windows, nạp dữ liệu mẫu và thử đăng nhập, mua hàng, quản lý đơn.

## 1. Yêu cầu

- PHP **8.0.2 trở lên**, Composer và extension `pdo_mysql`.
- MySQL hoặc MariaDB. File SQL được xuất từ MariaDB 10.4.32.
- Node.js **20.9 trở lên** và npm.
- Trình duyệt web hiện đại.

Kiểm tra các công cụ trong PowerShell:

```powershell
php --version
composer --version
node --version
npm.cmd --version
```

## 2. Cài cơ sở dữ liệu

1. Khởi động MySQL/MariaDB.
2. Mở phpMyAdmin, chọn **Import/Nhập**, chọn file `ecommerce_thltw.sql` ở thư mục gốc dự án và thực hiện nhập. File này tự tạo/chọn cơ sở dữ liệu `ecommerce_thltw`, tạo bảng và nạp dữ liệu sản phẩm, người dùng mẫu.

   Nếu nhập bằng dòng lệnh, mở **Command Prompt (cmd.exe)** tại thư mục gốc dự án rồi chạy:

   ```cmd
   mysql -u root -p < ecommerce_thltw.sql
   ```

3. Nếu tài khoản MySQL không phải `root` hoặc có mật khẩu, sẽ cấu hình lại thông tin tương ứng trong `backend/.env` ở bước tiếp theo.

Không chạy `php artisan migrate` thay cho bước nhập file SQL: hướng dẫn này dùng cấu trúc và dữ liệu trong dump SQL của dự án.

## 3. Cài và chạy Laravel API

Mở **Terminal 1** tại thư mục gốc:

```powershell
cd .\backend
Copy-Item .env.example .env
composer install
php artisan key:generate
```

Mở `backend/.env` và kiểm tra/cập nhật cấu hình cơ sở dữ liệu:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_thltw
DB_USERNAME=root
DB_PASSWORD=
```

Đặt `DB_USERNAME` và `DB_PASSWORD` theo tài khoản MySQL/MariaDB trên máy. Nếu thư mục `backend/public/storage` chưa có liên kết đến `backend/storage/app/public`, tạo liên kết một lần:

```powershell
php artisan storage:link
```

Khởi động API:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Giữ terminal này mở. Địa chỉ gốc API là `http://127.0.0.1:8000`; các endpoint API có tiền tố `/api`, ví dụ `http://127.0.0.1:8000/api/san-pham`.

## 4. Cài và chạy Next.js

Mở **Terminal 2** tại thư mục gốc dự án:

```powershell
cd .\frontend
npm.cmd ci
```

Tạo file `frontend/.env.local` với nội dung:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Chạy giao diện:

```powershell
npm.cmd run dev
```

Giữ terminal này mở. Truy cập website tại **http://localhost:3000**.

## 5. Địa chỉ và tài khoản dùng thử

| Mục đích | Địa chỉ |
|---|---|
| Cửa hàng | [http://localhost:3000](http://localhost:3000) |
| Đăng nhập khách hàng | [http://localhost:3000/login](http://localhost:3000/login) |
| Đăng nhập quản trị | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| API Laravel | [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api) |

Các tài khoản dưới đây có trong `ecommerce_thltw.sql`; chúng chỉ xuất hiện trong cơ sở dữ liệu sau khi nhập file SQL. Có thể đăng nhập bằng username hoặc email:

| Vai trò | Username | Email | Mật khẩu |
|---|---|---|---|
| Quản trị viên | `admin` | `admin@example.com` | `password` |
| Khách hàng | `khachhang01` | `an@example.com` | `password` |

Đây là thông tin demo công khai, không dùng làm mật khẩu thật. `DatabaseSeeder.php` hiện không tạo các tài khoản này; cần nhập file SQL như hướng dẫn ở trên. Có thể kiểm tra hai dòng tài khoản sau khi nhập bằng phpMyAdmin, bảng `nguoi_dung`, hoặc truy vấn:

```sql
SELECT username, email, vai_tro, status
FROM nguoi_dung
WHERE username IN ('admin', 'khachhang01');
```

## 6. Thử các chức năng chính

### Đăng nhập quản trị

1. Mở `/admin/login`.
2. Đăng nhập bằng tài khoản `admin` ở bảng trên.
3. Thử xem danh mục, thương hiệu, sản phẩm, người dùng, giỏ hàng và đơn hàng. Các chức năng quản trị cần API Laravel đang chạy.

### Thử mua hàng

1. Đăng nhập tại `/login` bằng tài khoản khách hàng ở trên **trước khi đặt hàng**. Như vậy đơn sẽ gắn với tài khoản và có thể xem lại trong khu vực đơn hàng.
2. Mở `/products`, chọn một sản phẩm đang còn hàng rồi thêm vào giỏ.
3. Mở `/cart` và chọn thanh toán.
4. Điền họ tên, số điện thoại gồm 10 chữ số và địa chỉ giao hàng.
5. Chọn **COD** để thử nhanh; nhấn **Đặt hàng**. Hệ thống tạo đơn và chuyển đến trang chi tiết đơn hàng. Quản trị viên có thể xem và xử lý đơn tại `/admin/orders`.

Tài khoản và mật khẩu mẫu được lấy từ dữ liệu trong SQL dump; cần nhập dump trước khi đăng nhập. Tài khoản hiện chưa được thử đăng nhập thực tế trong môi trường phát triển này.

### Thanh toán QR, COD và tình trạng MoMo/VNPay

- Checkout hiện chỉ cung cấp **QR chuyển khoản ngân hàng** và **COD**. Chọn COD để thử đặt đơn mà không cần cấu hình thanh toán.
- QR được tạo theo số tiền và mã đơn. Muốn thử QR, cửa hàng phải cấu hình chuỗi VietQR/EMVCo tĩnh hợp lệ tại `MOMO_QR_TINH` và tên người nhận tại `MOMO_NHAN_TEN` trong `backend/.env`, sau đó khởi động lại API. Không đưa thông tin tài khoản hoặc cấu hình riêng tư vào Git/README.
- QR là chuyển khoản cần cửa hàng kiểm tra và xác nhận thủ công; thao tác “Tôi đã chuyển khoản” không tự xác nhận tiền đã vào tài khoản. Chỉ thử chuyển khoản thật khi được cửa hàng cho phép.
- Backend có mã tích hợp MoMo, nhưng checkout hiện chưa có lựa chọn MoMo trực tuyến; vì vậy chưa thể hướng dẫn demo thanh toán MoMo trực tuyến như chức năng sẵn có. Dự án hiện cũng chưa có lựa chọn VNPay. Muốn demo các cổng này cần triển khai và kiểm thử luồng riêng trước.

## 7. Xử lý sự cố thường gặp

- **Không kết nối được API:** kiểm tra Terminal 1 còn chạy và `NEXT_PUBLIC_API_URL` trong `frontend/.env.local` đúng địa chỉ; khởi động lại Next.js sau khi sửa file môi trường.
- **Lỗi kết nối cơ sở dữ liệu:** kiểm tra dịch vụ MySQL/MariaDB đang chạy, đã nhập SQL và thông tin `DB_*` trong `backend/.env` chính xác.
- **Không thấy mã QR:** kiểm tra `MOMO_QR_TINH` là chuỗi VietQR/EMVCo tĩnh hợp lệ, không phải URL hoặc đường dẫn ảnh; hoặc chọn COD để tiếp tục thử đặt đơn.
- **Ảnh sản phẩm không hiển thị:** kiểm tra các tệp ảnh trong `backend/storage/app/public` và liên kết `backend/public/storage`.
