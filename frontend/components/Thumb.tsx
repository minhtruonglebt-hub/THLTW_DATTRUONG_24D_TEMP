// Ảnh nhỏ trong bảng (logo, ảnh sản phẩm). Không có ảnh thì hiện dấu "—".

import Image from "next/image";
import { mediaUrl } from "@/lib/format";

type ThumbProps = {
  src?: string | null; // đường link ảnh
  className: string; // kích thước, vd: "h-10 w-10 object-cover"
};

export default function Thumb({ src, className }: ThumbProps) {
  const url = mediaUrl(src);
  if (!url) return <>—</>;
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <span className="absolute text-slate-400">—</span>
      <Image
        key={url}
        src={url}
        alt=""
        fill
        sizes="40px"
        unoptimized
        className={`rounded ${className}`}
        onError={(event) => event.currentTarget.classList.add("hidden")}
      />
    </span>
  );
}
