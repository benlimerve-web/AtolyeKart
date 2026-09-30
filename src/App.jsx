import { useState } from "react";
import ProductList from "./components/ProductList";
import StockNotifyForm from "./components/StockNotifyForm";
import CatalogQrCode from "./components/CatalogQrCode";
import ChatWidget from "./components/ChatWidget";
import { products } from "./data/products";

const CATALOG_QR_URL = "https://atolyekart-three.vercel.app";
const HERO_IMAGE = "/images/Gemini_Generated_Image_a78khta78khta78k.webp";

export default function App() {
  const [showStockForm, setShowStockForm] = useState(false);

  return (
    <>
      <header
        className="hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="hero-content">
          <h1>Kilden</h1>
          <p>El Yapımı Seramik ve Doğal Malzeme Atölyesi</p>
          <a href="#urunler" className="hero-button">
            Ürünleri Keşfet
          </a>
        </div>
      </header>

      <main id="urunler">
        <ProductList />

        <CatalogQrCode url={CATALOG_QR_URL} />

        <section className="stock-notify">
          {showStockForm ? (
            <StockNotifyForm products={products} />
          ) : (
            <button type="button" onClick={() => setShowStockForm(true)}>
              Stok Bildirimi Iste
            </button>
          )}
        </section>
      </main>

      <ChatWidget />

      <footer>
        Kilden &copy; 2026
      </footer>
    </>
  );
}
