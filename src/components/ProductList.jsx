import { products } from "../data/products";
import ProductCard from "./ProductCard";

export default function ProductList() {
  return (
    <div className="products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
