// Gọi API thương hiệu:  GET /api/thuong-hieu
//   [ { id: 1, ten_thuong_hieu: "Nike", logo_url: "..." }, ... ]

import { API, callApi } from "@/lib/api";

export async function getBrands() {
  const json = await callApi(`${API}/thuong-hieu`, { cache: "no-store" });
  return json.data ?? [];
}
