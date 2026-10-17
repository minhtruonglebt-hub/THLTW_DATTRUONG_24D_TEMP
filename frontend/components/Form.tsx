// =====================================================================
// FILE NÀY LÀ GÌ?
// Các mảnh dùng chung cho form thêm / sửa (danh mục, thương hiệu, sản phẩm):
//   - inputClass  : kiểu dáng của ô nhập
//   - Modal       : cái hộp nổi (popup) chứa form, nền mờ phía sau
//   - Field       : một ô nhập có nhãn phía trên
//   - FormActions : dòng báo lỗi + nút "Huỷ" / "Lưu" ở cuối form
// =====================================================================

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

// ---------- Hộp nổi ----------
type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    // Lớp nền mờ phủ toàn màn hình: bấm ra ngoài thì đóng
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-6"
      onMouseDown={onClose}
    >
      {/* Thẻ trắng ở giữa: stopPropagation để bấm BÊN TRONG thì không bị đóng */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ---------- Một ô nhập có nhãn ----------
type FieldProps = {
  label: string;
  required?: boolean; // true = hiện dấu * đỏ
  wide?: boolean; // true = chiếm cả 2 cột (dùng cho ô mô tả, ảnh, công tắc)
  children: React.ReactNode; // chính là <input> / <select> / <textarea>
};

export function Field({ label, required, wide, children }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

// ---------- Báo lỗi + nút Huỷ / Lưu ----------
type FormActionsProps = {
  error: string; // lỗi từ Laravel ("" = không hiện)
  busy: boolean; // đang gửi? (khoá nút Lưu)
  onClose: () => void;
};

export function FormActions({ error, busy, onClose }: FormActionsProps) {
  return (
    <>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
        >
          Huỷ
        </button>
        <button
          disabled={busy}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Đang lưu…" : "Lưu"}
        </button>
      </div>
    </>
  );
}
