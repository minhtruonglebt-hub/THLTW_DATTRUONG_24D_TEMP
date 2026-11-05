import Link from "next/link";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none " +
  "transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

type AuthCardProps = {
  title: string;
  subtitle: string;
  wide?: boolean;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, wide, children }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-800">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className={`relative w-full rounded-[2rem] border border-white/60 bg-white p-6 shadow-2xl shadow-black/20 sm:p-9 ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
          <span aria-hidden="true">←</span> Cửa hàng
        </Link>
        <div className="mb-5 mt-7 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">S</div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Chào mừng bạn</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
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
