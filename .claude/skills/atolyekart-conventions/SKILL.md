---
name: atolyekart-conventions
description: Use when adding or editing a React component, or wiring a form (Siparis Ver / Stok Bildirimi Iste) to the webhook, in the AtolyeKart project.
---

# AtolyeKart Conventions

## Overview

Component and webhook-payload conventions specific to the AtolyeKart repo (Vite + React, JavaScript only, `.jsx` — no TypeScript, no class components).

## Bileşen Kuralları

- Her bileşen `src/components/` altında **kendi dosyasında** yaşar (örn. `ProductCard.jsx`).
- Her dosya **tek bir fonksiyon bileşeni** export eder — sınıf bileşeni yok, aynı dosyada birden fazla bileşen yok.
- Bileşen veriyi **props ile** alır; kendi içinde veri kurmaz/fetch etmez (bkz. `ProductList` → `ProductCard` → `ProductImage` zinciri; veri `src/data/products.js`'ten akar).

```jsx
// src/components/ExampleCard.jsx
function ExampleCard({ title, price }) {
  return (
    <div className="example-card">
      <h3>{title}</h3>
      <p>{price} TL</p>
    </div>
  )
}

export default ExampleCard
```

## Webhook Veri Sözleşmesi

İki form var, ikisi de **aynı webhook URL'sine POST** isteğiyle gönderilir. Formu ayırt eden alan `type`.

| Form | `type` | Alanlar |
|---|---|---|
| Siparis Ver | `order` | `name`, `product`, `phone` |
| Stok Bildirimi Iste | `stock_notify` | `name`, `email`, `product` |

```json
// Siparis Ver
{ "type": "order", "name": "...", "product": "...", "phone": "..." }

// Stok Bildirimi Iste
{ "type": "stock_notify", "name": "...", "email": "...", "product": "..." }
```

```js
async function submitToWebhook(payload) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// submitToWebhook({ type: 'order', name, product, phone })
// submitToWebhook({ type: 'stock_notify', name, email, product })
```

## Common Mistakes

- Bir dosyada birden fazla bileşen tanımlamak, veya sınıf bileşeni kullanmak.
- Bileşene props ile geçmesi gereken veriyi bileşen içinde sabitlemek.
- `type` alanını atlamak veya form adını olduğu gibi göndermek (örn. `"siparis"`) — sözleşme tam olarak `order` / `stock_notify` bekler.
- İki form için ayrı webhook URL'si tanımlamak — ikisi de aynı URL'ye POST edilir, ayrım `type` alanıyla yapılır.
