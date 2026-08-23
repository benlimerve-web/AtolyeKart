import { useState } from "react";
import { sendToWebhook } from "../lib/webhook";

export default function OrderForm({ productName }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const result = await sendToWebhook({
      type: "order",
      name,
      product: productName,
      phone,
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
        <input type="text" value={productName} readOnly disabled />
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
        Telefon
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </label>
      <label className="consent-label">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        Adım, telefon numaram ve sipariş bilgilerimin bu talebi işlemek amacıyla
        işlenmesini kabul ediyorum.
      </label>
      <button type="submit" disabled={status === "sending" || !consent}>
        {status === "sending" ? "Gönderiliyor..." : "Gönder"}
      </button>
      {status === "error" && <p className="form-error">{error}</p>}
    </form>
  );
}
