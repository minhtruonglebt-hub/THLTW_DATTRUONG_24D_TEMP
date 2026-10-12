// =====================================================================
// FILE NÀY LÀ GÌ?
// Mọi thứ dùng chung để "nói chuyện" với Laravel:
//   - API         : địa chỉ gốc của Laravel
//   - callApi()   : gửi yêu cầu (thêm / sửa / xoá / đăng nhập...)
//   - fetchList() : lấy danh sách từ API admin
//   - useList()   : hook giúp trang nào cũng lấy danh sách chỉ bằng 1 dòng
// =====================================================================

import { useEffect, useState } from "react";

// "Row" = một dòng dữ liệu (một danh mục, một sản phẩm, một đơn hàng...)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

// Địa chỉ Laravel, đọc từ file .env.local (nếu không có thì dùng địa chỉ mặc định)
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

// ---------------------------------------------------------------------
// 1. XỬ LÝ LỖI
// ---------------------------------------------------------------------
// Laravel báo lỗi theo 2 dạng:
//   1) Lỗi nhập liệu: { errors: { ten: ["Tên không được trống"], gia: ["Giá phải là số"] } }
//   2) Lỗi chung:     { message: "Không tìm thấy" }
// Hàm này gom lại thành 1 câu để hiển thị cho người dùng.
function getErrorMessage(json: Row): string {
  if (json.errors) {
    return Object.values(json.errors).flat().join(" • ");
  }
  return json.message ?? "Có lỗi xảy ra";
}

// ---------------------------------------------------------------------
// 2. GỬI YÊU CẦU LÊN API
// ---------------------------------------------------------------------
//   - Thành công: trả về dữ liệu JSON server gửi lại
//   - Thất bại:   ném lỗi (throw) với nội dung dễ đọc,
//                 nơi gọi hàm sẽ bắt bằng try/catch
//   - token (không bắt buộc): truyền vào khi API yêu cầu đăng nhập
export async function callApi(url: string, options: RequestInit, token?: string): Promise<Row> {
  const headers: Record<string, string> = {
    Accept: "application/json", // báo Laravel trả JSON (không trả trang HTML)
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`; // "thẻ ra vào" của người đã đăng nhập
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    // fetch ném lỗi khi không kết nối được tới server (vd: chưa bật Laravel)
    throw new Error("Không kết nối được máy chủ. Kiểm tra Laravel đang chạy ở cổng 8000.");
  }

  // Nếu server không trả JSON thì coi như object rỗng, tránh bị crash
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(json));
  }
  return json;
}

// ---------------------------------------------------------------------
// 3. LẤY DANH SÁCH
// ---------------------------------------------------------------------
// key là tên mục, vd: "danh-muc" -> gọi  GET  /api/admin/danh-muc
export async function fetchList(key: string): Promise<Row[]> {
  const json = await callApi(`${API}/admin/${key}`, { cache: "no-store" });
  return json.data ?? json; // Laravel bọc danh sách trong "data"
}

// ---------------------------------------------------------------------
// 4. HOOK useList: dùng ở mỗi trang để lấy danh sách
// ---------------------------------------------------------------------
// Cách dùng:   const { rows, error, reload } = useList("danh-muc");
//   rows   : danh sách (null = đang tải)
//   error  : thông báo lỗi nếu tải thất bại ("" = không lỗi)
//   reload : gọi hàm này để tải lại (vd: sau khi thêm / sửa / xoá xong)
export function useList(key: string) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0); // mỗi lần tăng số này là tải lại 1 lần

  useEffect(() => {
    fetchList(key)
      .then((data) => {
        setRows(data);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [key, reloadCount]);

  function reload() {
    setReloadCount(reloadCount + 1);
  }

  return { rows, error, reload };
}
