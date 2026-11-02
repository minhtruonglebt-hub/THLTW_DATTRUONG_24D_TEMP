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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Quản lý cửa hàng</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{count} bản ghi</p>
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
            className="whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            + Thêm mới
          </button>
        )}
      </div>
    </div>
  );
}
