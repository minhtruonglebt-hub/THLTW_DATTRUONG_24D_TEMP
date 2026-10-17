// =====================================================================
// FILE NÀY LÀ GÌ?
// Mọi thứ dùng chung để "nói chuyện" với Laravel:
//   - API         : địa chỉ gốc của Laravel
//   - callApi()   : gửi yêu cầu (thêm / sửa / xoá / đăng nhập...)
//   - fetchList() : lấy danh sách từ API admin
//   - useList()   : hook giúp trang nào cũng lấy danh sách chỉ bằng 1 dòng
// =====================================================================

import { useCallback, useEffect, useState } from "react";

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
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

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
  const rows = json.data ?? json;
  if (!Array.isArray(rows)) {
    throw new Error("Dữ liệu danh sách không đúng định dạng.");
  }
  return rows;
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
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    fetchList(key)
      .then((data) => {
        if (!isCurrentRequest) return;
        setRows(data);
        setError("");
      })
      .catch((cause: unknown) => {
        if (!isCurrentRequest) return;
        setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu.");
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [key, reloadCount]);

  const reload = useCallback(() => {
    setError("");
    setLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { rows, error, loading, reload };
}
