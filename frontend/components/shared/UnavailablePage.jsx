export default function UnavailablePage({ title = "Trang này" }) {
  return (
    <section className="mx-auto min-h-72 max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-slate-600">Tính năng này đang được hoàn thiện.</p>
    </section>
  );
}
