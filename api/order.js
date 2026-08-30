// Sipariş Ver ve Stok Bildirimi Iste formlarının ortak sunucu tarafı proxy'si.
// Client -> /api/order -> WEBHOOK_URL. Webhook URL'i artık client bundle'ına
// hiç gömülmüyor, sadece burada server-side kullanılıyor.
// Payload formatı için bkz. .claude/skills/atolyekart-conventions/SKILL.md
import jwt from "jsonwebtoken";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

// Bellek-içi, IP başına istek sayacı. Function instance'ı yeniden kullanıldığı
// sürece (Fluid Compute) geçerli; cold start'ta sıfırlanır. Basit bir
// anti-abuse katmanı olarak yeterli, kesin/dağıtık bir limiter değil.
const requestCounts = new Map();

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too Many Requests" });
  }

  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("WEBHOOK_URL tanımlı değil. .env dosyasını kontrol edin (bkz. .env.example).");
    return res.status(500).json({ ok: false, error: "Sunucu yapılandırma hatası." });
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook isteği başarısız oldu. Status: ${webhookResponse.status}`);
    }

    return res.status(200).json({ ok: webhookResponse.ok });
  } catch (error) {
    console.error(`Webhook isteğinde hata: ${error.message}. Status: ${error.status ?? "yok"}`);
    return res.status(502).json({ ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." });
  }
}
