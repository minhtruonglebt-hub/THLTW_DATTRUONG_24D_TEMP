"use client";

// Hook đọc giỏ hàng (lưu trong localStorage) và tự cập nhật khi giỏ thay đổi.
// Dùng ở trang Giỏ hàng và trang Thanh toán.

import { useMemo, useSyncExternalStore } from "react";

function subscribe(onChange) {
  window.addEventListener("cartUpdated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("cartUpdated", onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getSnapshot = () => window.localStorage.getItem("cart") || "[]";
const getServerSnapshot = () => "[]";

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    let items = [];
    try {
      const parsed = JSON.parse(snapshot);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      // dữ liệu hỏng => coi như giỏ trống
    }
    const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    return { items, total };
  }, [snapshot]);
}
