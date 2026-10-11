// =====================================================================
// FILE NÀY LÀ GÌ?
// Hàm dùng chung để gửi yêu cầu (thêm / sửa / xoá / đăng nhập...) lên Laravel
// và xử lý thông báo lỗi.
// =====================================================================

import type { Row } from "./admin-config";

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

// Gửi yêu cầu lên API.
//   - Thành công: trả về dữ liệu JSON server gửi lại
//   - Thất bại:   ném lỗi (throw) với nội dung lỗi dễ đọc,
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
