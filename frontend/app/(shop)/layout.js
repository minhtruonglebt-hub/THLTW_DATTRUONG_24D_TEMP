import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

// Khung chung cho mọi trang trong (shop): Header ở trên, Footer ở dưới
export default function ShopLayout({ children }) {
  return (
    <div className="shop-shell">
      <Header />
      <main className="min-h-[65vh]">{children}</main>
      <Footer />
    </div>
  );
}
