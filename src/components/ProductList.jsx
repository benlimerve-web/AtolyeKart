import { useState } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";

const categories = [
  { id: "all", label: "Tümü" },
  { id: "seramik", label: "Seramik" },
  { id: "ahsap", label: "Ahşap" },
  { id: "taki", label: "Takı" },
];

export default function ProductList() {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div>
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={category.id === activeCategory ? "active" : ""}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="products">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
