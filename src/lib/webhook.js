// Sipariş Ver ve Stok Bildirimi Iste formlarının gönderim yaptığı ortak endpoint.
// Payload formatı için bkz. .claude/skills/atolyekart-conventions/SKILL.md
// Gerçek webhook URL'i client'a hiç gömülmez; /api/order sunucu tarafında
// WEBHOOK_URL'e (env) POST eder. Bu istek JWT (VITE_API_TOKEN) ile korunur.
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export async function sendToWebhook(payload) {
  if (!API_TOKEN) {
    console.error("VITE_API_TOKEN tanımlı değil. .env dosyasını kontrol edin (bkz. .env.example).");
    return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  }

  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
    }

    const result = await response.json();
    return result.ok
      ? { ok: true }
      : { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  } catch {
    return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  }
}
