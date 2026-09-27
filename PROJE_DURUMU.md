# AtolyeKart — Proje Durum Raporu

**Son güncelleme:** 30 Ağustos 2026
**Amaç:** Yeni bir sohbette Claude'a (ya da kendine) hızlıca bağlam vermek için.

---

## 1. Proje Nedir

AtolyeKart, el sanatları/zanaat atölyeleri (seramik, ahşap, takı) için hazırlanan bir dijital kartvizit + ürün vitrini POC'u. Örnek/demo marka: **"Kilden"**. Hedef kitle: bireysel hobi meraklıları — seri üretim değil, otantik/el yapımı ürüne değer veren alıcılar.

BizCard projesinden farklı olarak sektöre özel (fiziksel ürün satan atölyeler için).

---

## 2. Ortam / Klasör Yapısı

- VS Code'da **multi-root workspace**: `AtolyeKart-BizCard.code-workspace` — AtolyeKart ve BizCard aynı pencerede, kardeş klasörler.
- **GitHub repo:** `github.com/benlimerve-web/AtolyeKart` (public)
- **Vercel projesi:** `atolyekart-three.vercel.app` — takım: **mrv4** (Vercel dashboard'da bu takım altında; `benlimerve-4180` kişisel hesabıyla karışmaması gerekiyor, deploy hatalarında bu kontrol edilmeli)
- **n8n:** Docker ile kurulu, `localhost:5678`'de çalışıyor

---

## 3. Teknik Yapı (Web / React)

- Başlangıçta tek dosya statik HTML → **Vite + React**'e dönüştürüldü
- Bileşenler: `ProductCard`, `ProductList` (katalog), `ProductImage` — `src/components/` altında, her biri ayrı dosya, fonksiyon bileşeni
- Demo ürün verisi: `src/data/products.js`
- **Dil kararı:** Saf JavaScript, TypeScript YOK (CLAUDE.md kuralı)
- **QR kod:** `qrcode.react` kütüphanesi (Context7 MCP ile güncel dokümantasyon kullanılarak eklendi), canlı Vercel URL'ine yönlendiriyor
- `.claude/skills/` altında **SKILL.md**: bileşen kuralları (tek dosya, fonksiyon bileşeni) + webhook veri sözleşmesi

---

## 4. Formlar ve Webhook

İki form var:
- **"Sipariş Ver":** Ad, Ürün, Telefon → `{type: order, name, product, phone}`
- **"Stok Bildirimi İste":** Ad, E-posta → `{type: stock_notify, name, email, product}`

**Akış:** Form → `/api/order` (Vercel serverless function) → dış webhook'a POST

**Güvenlik katmanı (`api/order.js`):**
- Sadece POST kabul eder
- JWT doğrulaması (`jsonwebtoken` paketi, `JWT_SECRET` ile) — **build-time'da gömülü sabit token** (`VITE_API_TOKEN`), gerçek kullanıcı girişi yok, sadece basit bot/script engelleme
- Rate limiting: bellek-içi (in-memory) sayaç, dakikada 10 istek/IP
- **Bilinen sınırlama:** Sıralı isteklerde çalışıyor (10 istek 200, 11. istek 429 — test edildi, kanıtlandı), ama **eşzamanlı/paralel** isteklerde çalışmıyor (Vercel'in çoklu instance mimarisi yüzünden). Kalıcı çözüm: Upstash Redis (henüz yapılmadı).

**Env değişkenleri** (`.env` lokal + Vercel > Environments > Production):
- `WEBHOOK_URL` (server-only, eskiden `VITE_WEBHOOK_URL` idi, isim değişti)
- `JWT_SECRET` (server-only, gerçek gizli)
- `VITE_API_TOKEN` (client'a gömülü, "gizli" değil ama düzenlilik için env'de)

---

## 5. n8n Workflow'u ("AtolyeKart Siparis")

**Webhook Trigger** (path: `siparis-ver`) → **Google Sheets** (Append Row, dosya: "AtolyeKart-siparis", sayfa: Sayfa1, sütunlar: Ad/Ürün/Telefon/Tarih) → **Google Gemini** (thank-you mesajı + tahmini hazırlanma süresi üretir) → **Gmail** (mesajı **müşteriye değil, atölye sahibinin kendi mailine** bildirim olarak gönderir — bilinçli karar, form e-posta toplamıyor)

**Alan eşleştirme notu:** Webhook body'sinde alanlar direkt `body.name`, `body.product`, `body.phone` (ekstra nesting yok). Gemini çıktısı: `content.parts[0].text` yolunda.

**Google OAuth:** Google Cloud Console'da "n8n" adlı bir OAuth client var (Sheets + Gmail + Drive API'leri enable edilmiş olmalı). Gmail credential'ında "Client authentication failed" hatası yaşandı, çözüm süreci yarım kaldı (bkz. Açık Sorunlar).

---

## 6. Diğer Tamamlanan Adımlar

- **Git + Worktree egzersizi:** Main'de küçük hata (stok bildirimi email format kontrolü) düzeltildi, ayrı worktree'de kategori filtresi özelliği geliştirildi, merge edildi.
- **GitHub:** `gh` CLI kurulu ve giriş yapılmış, ilk commit push edildi (9 commit'lik geçmiş korunarak).
- **KVKK:** Sipariş formuna açık rıza checkbox'ı eklendi, PrivacyPolicy sayfası oluşturuldu. İletişim e-postası şu an **placeholder** (gerçek değer girilmedi).
- **Validasyon/rate limit testi:** Tamamlandı, sonuç notu yazıldı (bkz. bölüm 4'teki bilinen sınırlama).

---

## 7. AÇIK SORUNLAR (henüz çözülmedi)

1. **WEBHOOK_URL şu an geçersiz** — eski webhook.site adresinin süresi dolmuş (404 hatası). Karar verildi: ngrok ile n8n'i internete açıp `WEBHOOK_URL`'i n8n'in production adresine güncellemek. Adımlar verildi ama **tamamlandığı doğrulanmadı**. Bu yüzden şu an canlı sitede "Sipariş Ver" **çalışmıyor**.
2. **n8n Gmail node'unda OAuth hatası** ("Client authentication failed") — Google Cloud'da Gmail API enable + doğru scope eklenmesi gerekiyor, son durumu netleşmedi.
3. **Expo mobil port (2.7) tamamlanmadı** — Kod dönüşümü bitti (worktree: `.claude/worktrees/expo-migration/mobile`), ama telefonla test edilirken sürekli "Internet connection appears to be offline" hatası alındı. LAN modu ve tunnel modu (ngrok) denendi, sorun netleşmedi. **Master'a merge edilmedi**, worktree'de bekliyor.
4. **2.6 Security checklist** hiç yapılmadı — "Ders 3'teki checklist" paylaşılmadı.
5. **Privacy Policy'deki iletişim e-postası** placeholder, gerçek değerle değiştirilmeli.

---

## 8. Teslim Çıktıları — Durum

| Kalem | Durum |
|---|---|
| Canlı Vercel URL'si | ✅ Hazır (ama sipariş formu şu an çalışmıyor, bkz. Açık Sorunlar #1) |
| .env commit kontrolü | ⚠️ Yöntem biliniyor (`git log --all --full-history -- .env`), çalıştırılıp kanıtlanmadı |
| Vercel secret ekran görüntüsü | ⚠️ Henüz alınmadı |
| Validasyon/rate limit test notu | ✅ Tamamlandı |
| Expo Go/mobil ekran görüntüsü | ❌ Blocked (bkz. Açık Sorunlar #3) |
| Kısa düşünce yanıtları | ❌ Henüz yazılmadı |

---

## 9. Bir Sonraki Sohbette İlk Yapılacaklar (öneri sırası)

1. WEBHOOK_URL'i n8n/ngrok'a bağlayıp sipariş akışını çalışır hale getir
2. Gmail OAuth hatasını çöz
3. Uçtan uca test: sipariş ver → Sheets'e yazılıyor mu, mail geliyor mu
4. Expo bağlantı sorununu çöz (ya da geçici olarak bırakıp diğer teslim kalemlerine geç)
5. Kalan teslim kalemlerini (env kontrolü, secret ekran görüntüsü, düşünce yanıtları) tamamla
