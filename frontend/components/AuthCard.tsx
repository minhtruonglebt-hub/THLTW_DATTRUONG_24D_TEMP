import Link from "next/link";

const INPUT_CLASS =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

type AuthCardProps = {
  title: string;
  subtitle: string;
  wide?: boolean;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, wide, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-800">
      <div className={`w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8 ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <Link href="/" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          ← Cửa hàng
        </Link>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}

type AuthFieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
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
