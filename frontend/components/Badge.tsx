// Nhãn nhỏ có màu, vd: [Hiển thị] [Ẩn] [Chờ xác nhận]
//   tone: "ok" = xanh lá, "off" = xám, "warn" = vàng

type BadgeProps = {
  text: string;
  tone: "ok" | "off" | "warn";
};

const COLORS = {
  ok: "bg-emerald-100 text-emerald-800",
  off: "bg-stone-200 text-stone-600",
  warn: "bg-amber-100 text-amber-800",
};

export default function Badge({ text, tone }: BadgeProps) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${COLORS[tone]}`}>{text}</span>;
}
