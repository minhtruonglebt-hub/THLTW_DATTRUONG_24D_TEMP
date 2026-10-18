// Gọi API danh mục:  GET /api/danh-muc
// Trả về danh sách danh mục CHA, mỗi danh mục có thêm mảng "children" (danh mục con).
//   [ { id: 1, ten_danh_muc: "Thời trang", children: [ {id: 5, ...}, ... ] }, ... ]

import { API, callApi } from "@/lib/api";

export async function getCategories() {
  const json = await callApi(`${API}/danh-muc`, { cache: "no-store" });
  return json.data ?? [];
}
