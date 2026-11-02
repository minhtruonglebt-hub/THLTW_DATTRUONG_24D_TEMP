// =====================================================================
// THANH PHÂN TRANG:   ‹ 1 2 [3] 4 5 … 10 ›
//
//   currentPage  : trang đang xem
//   pageCount    : tổng số trang
//   onPageChange : hàm chạy khi bấm đổi trang (nhận số trang mới)
//   alwaysShow   : true = luôn hiện thanh phân trang, kể cả khi chỉ có 1 trang
// =====================================================================

export default function Pagination({ currentPage, pageCount, onPageChange, alwaysShow = false }) {
  // Chỉ có 1 trang thì ẩn thanh phân trang (trừ khi alwaysShow = true)
  if (pageCount <= 1 && !alwaysShow) return null;
  const totalPages = Math.max(pageCount, 1); // luôn có ít nhất 1 trang

  // Tạo mảng [1, 2, 3, ..., pageCount]
  const allPages = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Chỉ giữ: trang đầu, trang cuối và các trang gần trang hiện tại (cách tối đa 2)
  const visiblePages = allPages.filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2,
  );

  // Giữa 2 trang bị cách quãng thì chèn dấu "…"
  const items = [];
  visiblePages.forEach((page, index) => {
    if (index > 0 && page - visiblePages[index - 1] > 1) items.push("...");
    items.push(page);
  });

  const baseButton = "min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseButton} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        ‹ Trang trước
      </button>

      {items.map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`${baseButton} ${
              item === currentPage
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${baseButton} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Trang sau ›
      </button>
    </div>
  );
}
