// api/order.js'in doğrulayacağı, frontend'e gömülecek JWT'yi üretir.
// Kullanım: JWT_SECRET=... node scripts/generate-token.mjs
// (.env'deki JWT_SECRET'ı okumak için: node --env-file=.env scripts/generate-token.mjs)
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("JWT_SECRET ortam değişkeni bulunamadı.");
  process.exit(1);
}

const token = jwt.sign({ app: "atolyekart-web" }, secret, { expiresIn: "5y" });

console.log(token);
