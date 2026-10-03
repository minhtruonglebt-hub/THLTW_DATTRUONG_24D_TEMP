import Sidebar from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-100 text-slate-800">
      <Sidebar />
      <main className="min-w-0 flex-1 p-10">{children}</main>
    </div>
  );
}
