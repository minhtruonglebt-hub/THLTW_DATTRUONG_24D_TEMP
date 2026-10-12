// Phần đầu của mỗi trang quản lý: tiêu đề, số bản ghi, ô tìm kiếm, nút "Thêm mới".
// Trang nào không cho thêm (đơn hàng, giỏ hàng...) thì không truyền onAdd -> không hiện nút.

import { inputClass } from "./Form";

type PageHeaderProps = {
  title: string;
  count: number; // số bản ghi đang hiển thị
  search: string; // nội dung ô tìm kiếm
  onSearch: (value: string) => void; // chạy khi gõ vào ô tìm kiếm
  onAdd?: () => void; // chạy khi bấm "Thêm mới"
};

export default function PageHeader({ title, count, search, onSearch, onAdd }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500">{count} bản ghi</p>
      </div>
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm kiếm…"
          className={`${inputClass} w-64`}
        />
        {onAdd && (
          <button
            onClick={onAdd}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
          >
            + Thêm mới
          </button>
        )}
      </div>
    </div>
  );
}
