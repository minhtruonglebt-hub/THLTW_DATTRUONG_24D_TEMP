# Frontend quản lý cửa hàng

Giao diện Next.js dùng để quản lý danh mục, sản phẩm, thương hiệu, đơn hàng, giỏ hàng và người dùng thông qua API Laravel.

## Chạy ứng dụng

1. Mở terminal tại thư mục `frontend/`.
2. Cài package nếu đây là lần chạy đầu:

   ```bash
   npm install
   ```

3. Tạo file `.env.local` và cấu hình địa chỉ API:

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

4. Bật Laravel, sau đó chạy:

   ```bash
   npm run dev
   ```

Mở `http://localhost:3000`.

## Cấu trúc thư mục

```text
frontend/
├─ app/
│  ├─ (shop)/              Khu vực cửa hàng (đã tạo sẵn file rỗng, chưa có code)
│  │  ├─ cart/  checkout/  contact/  login/  register/  profile/
│  │  ├─ orders/ (+ [id])  posts/ (+ [slug])  products/ (+ [slug])
│  │  └─ layout.js  layout.css  page.jsx
│  ├─ admin/
│  │  ├─ login/            Đăng nhập admin  -> /admin/login
│  │  ├─ categories/       page (danh sách) + create + [id]   (+ trash: chưa có API)
│  │  ├─ brands/           page + create + [id]               (+ trash: chưa có API)
│  │  ├─ products/         page + create + [id]               (+ trash: chưa có API)
│  │  ├─ orders/           page (xem, huỷ đơn chờ xác nhận)
│  │  ├─ users/            page (chỉ xem)
│  │  ├─ carts/            page (chỉ xem)
│  │  ├─ banners/ contacts/ menus/ posts/ topics/   File rỗng, chưa có API
│  │  ├─ layout.jsx        Khung admin (menu trái + nội dung)
│  │  └─ page.jsx          Tổng quan
│  ├─ globals.css
│  └─ layout.js
├─ components/
│  ├─ admin/
│  │  ├─ AdminSidebar.tsx  Menu quản trị
│  │  └─ ResourceList.tsx  Bảng, tìm kiếm, xoá và thao tác đơn hàng
│  ├─ AuthCard.tsx  Form.tsx  Table.tsx  PageHeader.tsx
│  └─ Badge.tsx  Notice.tsx  RowActions.tsx  Thumb.tsx
└─ lib/
   ├─ api.ts             Gọi API và hook lấy danh sách
   ├─ admin-config.tsx   Cột dữ liệu hiển thị cho từng mục
   ├─ auth.ts            Đăng nhập, đăng ký và đăng xuất
   ├─ format.ts          Định dạng tiền và ngày
   └─ menu.ts            Danh sách menu (key = API, path = thư mục trong app/admin)
```

## Cách các phần kết nối

- Mỗi thư mục trong `app/admin/` là một đường dẫn, ví dụ `admin/products` mở tại `/admin/products`, thêm mới ở `/admin/products/create`, sửa ở `/admin/products/{id}`.
- Trang danh sách gọi `ResourceList` với `resourceKey` (tên API Laravel, vd `san-pham`) và `editPath` (thư mục admin, vd `products`). Cấu hình cột nằm trong `lib/admin-config.tsx`.
- Trang `create` và `[id]` là form riêng; lưu xong quay về danh sách.
- `useList("san-pham")` gọi `GET /api/admin/san-pham`; cập nhật gửi `POST` kèm `_method=PUT`, ảnh gửi bằng `FormData`.
- Ảnh được trỏ về host API; nếu ảnh hiện dấu `—`, hãy kiểm tra file trong `backend/storage/app/public` và liên kết `backend/public/storage`.
- Đơn hàng chỉ huỷ được khi trạng thái là `cho_xac_nhan`. Giỏ hàng và người dùng là trang xem.
- Các file rỗng (`(shop)`, `trash`, banners, contacts, menus, posts, topics, orders/create...) cần được viết code trước khi chạy `npm run build`.

## Chức năng

| Mục | Xem | Tìm kiếm | Thêm/Sửa | Xoá | Ghi chú |
|---|---:|---:|---:|---:|---|
| Danh mục | Có | Có | Có | Có | Chọn danh mục cha |
| Thương hiệu | Có | Có | Có | Có | Tải logo |
| Sản phẩm | Có | Có | Có | Có | Chọn danh mục, thương hiệu và tải ảnh |
| Đơn hàng | Có | Có | — | — | Huỷ đơn đang chờ xác nhận |
| Giỏ hàng | Có | Có | — | — | Chỉ xem |
| Người dùng | Có | Có | — | — | Chỉ xem |
| Tài khoản | — | — | — | — | Đăng nhập, đăng ký, đăng xuất |
