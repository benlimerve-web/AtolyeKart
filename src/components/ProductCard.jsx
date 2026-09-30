import { useState } from "react";
import OrderForm from "./OrderForm";

export default function ProductCard({ product }) {
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <p className="price">{product.price} TL</p>
      <p className="desc">{product.description}</p>

      {showOrderForm ? (
        <OrderForm productName={product.name} />
      ) : (
        <button type="button" onClick={() => setShowOrderForm(true)}>
          Sipariş Ver
        </button>
      )}
    </div>
  );
}
