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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{count} bản ghi</p>
      </div>
      <div className="flex w-full flex-wrap gap-3 sm:w-auto">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm kiếm…"
          className={`${inputClass} min-w-0 flex-1 sm:w-64 sm:flex-none`}
        />
        {onAdd && (
          <button
            onClick={onAdd}
            className="whitespace-nowrap rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            + Thêm mới
          </button>
        )}
      </div>
    </div>
  );
}
