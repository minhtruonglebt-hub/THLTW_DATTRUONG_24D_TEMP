// =====================================================================
// FILE NÀY LÀ GÌ?
// Hai mảnh giao diện dùng chung cho trang Đăng nhập và Đăng ký,
// để 2 trang trông giống nhau và không phải viết lại.
//   - AuthCard  : cái khung thẻ trắng nằm giữa màn hình (có tiêu đề)
//   - AuthField : một ô nhập có nhãn phía trên
// =====================================================================

// Giao diện (class Tailwind) của ô nhập, viết sẵn ở đây để file này không phụ thuộc file nào khác
const INPUT_CLASS =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

// ---------- Khung thẻ ----------
type AuthCardProps = {
  title: string; // vd: "Đăng nhập"
  subtitle: string; // dòng mô tả nhỏ bên dưới tiêu đề
  wide?: boolean; // true = thẻ rộng hơn (trang đăng ký có nhiều ô nên cần rộng)
  children: React.ReactNode; // nội dung bên trong thẻ (form, link...)
};

export function AuthCard({ title, subtitle, wide, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 text-slate-800">
      <div className={`w-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

// ---------- Ô nhập ----------
type AuthFieldProps = {
  name: string; // tên trường gửi lên Laravel (vd: "email")
  label: string; // chữ hiện phía trên ô
  type?: string; // text (mặc định), email, password...
  required?: boolean; // true = bắt buộc (hiện dấu * đỏ)
  minLength?: number; // số ký tự tối thiểu
  autoComplete?: string; // gợi ý cho trình duyệt tự điền (vd: "username")
};

export function AuthField({ name, label, type = "text", required, minLength, autoComplete }: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={INPUT_CLASS}
      />
    </label>
  );
}
