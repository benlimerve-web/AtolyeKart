import { useState } from "react";
import ProductList from "./components/ProductList";
import StockNotifyForm from "./components/StockNotifyForm";
import CatalogQrCode from "./components/CatalogQrCode";
import { products } from "./data/products";

const CATALOG_QR_URL = "https://atolyekart-three.vercel.app";

export default function App() {
  const [showStockForm, setShowStockForm] = useState(false);

  return (
    <>
      <header>
        <h1>Kilden</h1>
        <p>El Yapımı Seramik ve Doğal Malzeme Atölyesi</p>
      </header>

      <main>
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

      <footer>
        Kilden &copy; 2026
      </footer>
    </>
  );
}
