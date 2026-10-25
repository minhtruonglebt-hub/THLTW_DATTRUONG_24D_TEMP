// Dòng thông báo: xanh (thành công) hoặc đỏ (lỗi). Không có nội dung thì không hiện gì.
//   <Notice text="Đã xoá" ok />     -> xanh
//   <Notice text="Lỗi kết nối" />   -> đỏ

type NoticeProps = {
  text?: string;
  ok?: boolean;
};

export default function Notice({ text, ok = false }: NoticeProps) {
  if (!text) return null;
  const color = ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700";
  return <p role="status" className={`mb-4 rounded-lg border p-3 text-sm ${color}`}>{text}</p>;
}
