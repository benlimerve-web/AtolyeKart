import ProductList from "./components/ProductList";

export default function App() {
  return (
    <>
      <header>
        <h1>Kilden</h1>
        <p>El Yapımı Seramik ve Doğal Malzeme Atölyesi</p>
      </header>

      <main>
        <ProductList />
      </main>

      <footer>
        Kilden &copy; 2026
      </footer>
    </>
  );
}
