import { useState } from "react";
import { sendToWebhook } from "../lib/webhook";

export default function StockNotifyForm({ products }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(products[0]?.name ?? "");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const result = await sendToWebhook({
      type: "stock_notify",
      name,
      email,
      product,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "success") {
    return <p className="form-success">Talebiniz alındı, teşekkürler!</p>;
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <label>
        Ürün
        <select value={product} onChange={(e) => setProduct(e.target.value)} required>
          {products.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ad Soyad
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        E-posta
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Gönderiliyor..." : "Gönder"}
      </button>
      {status === "error" && <p className="form-error">{error}</p>}
    </form>
  );
}
