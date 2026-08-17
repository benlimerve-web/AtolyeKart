// Sipariş Ver ve Stok Bildirimi Iste formlarının gönderim yaptığı ortak webhook.
// Payload formatı için bkz. .claude/skills/atolyekart-conventions/SKILL.md
export const WEBHOOK_URL = "https://webhook.site/1e3b9476-3139-48f5-a235-ca8c2e8fdfc3";

export async function sendToWebhook(payload) {
  try {
    // no-cors: webhook.site CORS preflight/response header'ı dönmediği için
    // response opak gelir (status/body okunamaz). Bu yüzden response.ok
    // kontrolü yapılmıyor — fetch throw etmeden tamamlandıysa başarı sayılır.
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." };
  }
}
