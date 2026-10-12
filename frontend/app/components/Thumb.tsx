// Ảnh nhỏ trong bảng (logo, ảnh sản phẩm). Không có ảnh thì hiện dấu "—".

type ThumbProps = {
  src?: string | null; // đường link ảnh
  className: string; // kích thước, vd: "h-10 w-10 object-cover"
};

export default function Thumb({ src, className }: ThumbProps) {
  if (!src) return <>—</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`rounded ${className}`} />;
}
