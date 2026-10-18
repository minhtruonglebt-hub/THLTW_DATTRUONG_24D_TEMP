import { API } from "./api";

// =====================================================================
// FILE NÀY LÀ GÌ?
// Hai hàm nhỏ để hiển thị tiền và ngày cho đẹp.
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

export function mediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const apiOrigin = new URL(API).origin;
    const url = new URL(value, `${apiOrigin}/`);
    const isLocalHost = (host: string) => ["localhost", "127.0.0.1", "::1"].includes(host);

    if (isLocalHost(url.hostname) && isLocalHost(new URL(apiOrigin).hostname)) {
      url.host = new URL(apiOrigin).host;
      url.protocol = new URL(apiOrigin).protocol;
    }

    return url.toString();
  } catch {
    return value;
  }
}
