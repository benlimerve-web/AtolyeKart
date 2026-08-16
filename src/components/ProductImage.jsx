export default function ProductImage({ icon, category }) {
  return (
    <div className="product-image" role="img" aria-label={category}>
      <span aria-hidden="true">{icon}</span>
    </div>
  );
}
