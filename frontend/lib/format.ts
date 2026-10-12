// =====================================================================
// FILE NÀY LÀ GÌ?
// Mấy hàm nhỏ để hiển thị dữ liệu cho đẹp và để tìm kiếm.
// =====================================================================

// 1500000 -> "1.500.000 ₫"   (không có giá trị thì hiện "—")
export function money(value: unknown): string {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + " ₫";
}

// "2026-10-03T16:35:25" -> "16:35:25 3/10/2026"   (không có thì hiện "—")
export function date(value: unknown): string {
  if (!value) return "—";
  return new Date(String(value)).toLocaleString("vi-VN");
}

// Dùng cho ô tìm kiếm: trong các ô fields, có ô nào chứa từ khoá không?
//   - không phân biệt chữ hoa / thường
//   - từ khoá rỗng (chưa gõ gì) thì ai cũng khớp -> hiện tất cả
export function matches(keyword: string, fields: unknown[]): boolean {
  const k = keyword.trim().toLowerCase();
  return fields.some((f) => String(f ?? "").toLowerCase().includes(k));
}
