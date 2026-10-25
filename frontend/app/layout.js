import "./globals.css";

export const metadata = {
  title: "Quản lý cửa hàng",
  description: "Hệ thống quản lý cửa hàng",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
