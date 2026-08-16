import ProductImage from "./ProductImage";

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <ProductImage icon={product.icon} category={product.category} />
      <h2>{product.name}</h2>
      <p className="price">{product.price} TL</p>
      <p className="desc">{product.description}</p>
    </div>
  );
}
