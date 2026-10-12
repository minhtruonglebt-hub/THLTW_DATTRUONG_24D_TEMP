# Frontend đơn giản – Hướng dẫn

## 1. Cách cài vào project

1. Giải nén, chép đè hai thư mục `app/` và `lib/` vào thư mục `frontend/` của bạn.
2. **Xoá các file cũ không còn dùng:**
   - `app/admin/[resource]/`  (cả thư mục)
   - `lib/admin-config.tsx`
   - `lib/admin-forms.ts`
   - `lib/admin-api.ts`
3. Nếu Next báo lỗi lạ về `[resource]`: xoá thư mục `.next` rồi chạy lại `npm run dev`.

## 2. Cấu trúc thư mục

```
frontend/
├─ lib/                         ← code dùng chung (không có giao diện)
│  ├─ api.ts                    ← địa chỉ API, callApi (gửi yêu cầu), useList (lấy danh sách)
│  ├─ format.ts                 ← money (định dạng tiền), date, matches (tìm kiếm)
│  ├─ menu.ts                   ← danh sách 6 mục menu
│  └─ auth.ts                   ← đăng nhập / đăng ký / đăng xuất (giữ nguyên)
│
└─ app/
   ├─ components/               ← các mảnh giao diện nhỏ dùng lại nhiều nơi
   │  ├─ Table.tsx  PageHeader.tsx  Badge.tsx  Notice.tsx
   │  ├─ Thumb.tsx  RowActions.tsx  Form.tsx (Modal, Field, nút Lưu/Huỷ)
   │  └─ AuthCard.tsx           ← khung đăng nhập/đăng ký (giữ nguyên)
   │
   ├─ dang-nhap/page.tsx        ← /dang-nhap   (giữ nguyên)
   ├─ dang-ky/page.tsx          ← /dang-ky     (giữ nguyên)
   │
   └─ admin/
      ├─ layout.tsx  Sidebar.tsx  page.tsx (Tổng quan)
      ├─ danh-muc/    page.tsx + DanhMucForm.tsx
      ├─ thuong-hieu/ page.tsx + ThuongHieuForm.tsx
      ├─ san-pham/    page.tsx + SanPhamForm.tsx
      ├─ don-hang/    page.tsx
      ├─ gio-hang/    page.tsx
      └─ nguoi-dung/  page.tsx
```

Quy tắc của Next.js: **tên thư mục = đường link**. Thư mục `admin/danh-muc/` thì mở bằng `/admin/danh-muc`.
Mỗi mục có thư mục riêng, trong đó `page.tsx` là trang danh sách, `...Form.tsx` là form thêm/sửa.

## 3. Đối chiếu chức năng (không thiếu cái nào)

| Mục | Xem | Tìm kiếm | Thêm | Sửa | Xoá | Khác |
|---|---|---|---|---|---|---|
| Danh mục | ✔ | ✔ | ✔ | ✔ | ✔ | chọn danh mục cha (không cho chọn chính nó) |
| Thương hiệu | ✔ | ✔ | ✔ | ✔ | ✔ | upload logo, hiện logo trong bảng |
| Sản phẩm | ✔ | ✔ | ✔ | ✔ | ✔ | upload ảnh, chọn danh mục/thương hiệu, tồn kho = 0 tô đỏ |
| Đơn hàng | ✔ | ✔ | – | – | – | **Huỷ đơn** (chỉ đơn "Chờ xác nhận") |
| Giỏ hàng | ✔ | ✔ | – | – | – | |
| Người dùng | ✔ | ✔ | – | – | – | |
| Tổng quan | đếm số bản ghi từng mục, bấm vào để chuyển trang | | | | | |
| Tài khoản | Đăng nhập, Đăng ký (kiểm tra nhập lại mật khẩu), Đăng xuất, hiện tên ở Sidebar | | | | | |

Trang nào cũng có: thông báo thành công/lỗi, chữ "Đang tải…", dòng "Không có dữ liệu", hỏi xác nhận trước khi xoá/huỷ.

## 4. Luồng chạy (để trả lời cô)

**Xem danh sách:** trang gọi `useList("danh-muc")` → hook gọi `GET /api/admin/danh-muc` → Laravel trả danh sách → trang `.map()` ra từng dòng bảng.

**Tìm kiếm:** gõ vào ô → lưu vào state `search` → `list = rows.filter(...)` giữ dòng nào có ô chứa từ khoá (hàm `matches`).

**Thêm / Sửa:** bấm nút → mở form (`showForm = true`). Bấm Lưu → gom ô nhập bằng `FormData` → `POST` lên Laravel.
Khi **sửa** gửi thêm `_method=PUT` (Laravel không nhận file qua PUT thật nên phải gửi POST giả PUT).
Thành công → đóng form, báo "Đã lưu", `reload()` tải lại bảng.

**Xoá:** `confirm()` hỏi → `DELETE /api/danh-muc/{id}` → báo "Đã xoá" → `reload()`.

**Huỷ đơn:** `confirm()` hỏi → `POST /api/don-hang/{id}/huy` → báo "Đã huỷ đơn" → `reload()`.

**Đăng nhập:** gửi email/mật khẩu → Laravel trả token → lưu vào `localStorage` → chuyển sang `/admin`.
