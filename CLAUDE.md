# CLAUDE.md

Bu dosya, AtölyeKart projesinin n8n otomasyon mimarisini özetler. Claude Code ile bu proje üzerinde çalışırken buradaki bilgiyi bağlam olarak kullan.

## Proje Özeti

AtölyeKart, el yapımı ürünler satan bir atölyenin sipariş/stok süreçlerini otomatikleştiren ve bir RAG destekli müşteri chatbot'u sunan n8n tabanlı bir sistemdir. Sistem, self-hosted n8n (Docker) üzerinde çalışır ve şu servislerle entegredir: Google Sheets, Gmail, Google Gemini (LLM + embeddings), Redis (chat memory).

## Ortam ve Altyapı

- **n8n**: Docker Desktop üzerinde container olarak çalışıyor (image: `n8nio/n8n:2.14.2`).
- **Erişim**: `http://localhost:5678`
- **Redis**: Ayrı bir Docker container (`redis:latest`), n8n container'ı ile aynı özel Docker ağında (`n8n-net`) çalışıyor. Host adı n8n içinden `redis` olarak çözülüyor (port 6379, şifresiz — sadece POC/geliştirme amaçlı).
- **n8n API**: Ayarlar → n8n API üzerinden oluşturulan API key ile `http://localhost:5678/api/v1/...` uç noktaları kullanılabiliyor (örn. `/executions?workflowId=...`).
- **Vector Store**: Simple Vector Store (in-memory) — kalıcı değildir, n8n yeniden başlatıldığında veya container düşük hafızada kaldığında sıfırlanabilir. Prod'a geçişte Pinecone/Supabase gibi kalıcı bir vector DB'ye taşınmalı.

## Workflow'lar

### 1. AtölyeKart Sipariş Flow
Ana sipariş/stok bildirimi akışı.

**Zincir:**
`Webhook (POST /siparis-ver)` → `If (body.type == "order")`
- **true dalı** (Sipariş Ver): → `Call 'SW - Validate Order Input'` → `If1 (valid == true)`
  - true → `Append row in sheet` → `Message a model` (Gemini) → `Send a message` (Gmail)
  - false → `Code in JavaScript` (bilerek `throw new Error(...)` ile hata fırlatır → Error Workflow'u tetikler)
- **false dalı** (Stok Bildirimi İste): → `Call 'SW - Validate Order Input'1` (aynı sub-workflow, ikinci çağrı) → `AI Agent` (Google Gemini + Code Tool ile alternatif ürün önerisi)

**Webhook body örneği:**
```json
{ "type": "order", "name": "Test Kullanıcı", "product": "Seramik Kupa", "phone": "5551234567" }
```

**Not:** Google Sheets sütunları Türkçe: `Ad`, `Ürün`, `Telefon`, `Tarih`.

### 2. SW - Validate Order Input (Sub-workflow)
Ortak doğrulama mantığını tutan, iki farklı daldan (true/false) çağrılan tekrar kullanılabilir workflow.

- Trigger: `When Executed by Another Workflow` (Execute Sub-workflow Trigger)
- `Code` node: gelen `email` (aslında telefon) ve `product_id` (aslında ürün adı) alanlarını kontrol eder, `{ valid, reason, email, product_id }` döndürür.

### 3. Error Handler - Notify
Ana flow'un Settings → Error Workflow alanına bağlı, hata durumunda otomatik tetiklenen bağımsız workflow.

- `Error Trigger` → `Send a message` (Gmail) — hatanın workflow adı, node adı ve mesajını içeren bildirim gönderir.
- **Önemli:** Error Workflow yalnızca *production* execution'larda (Publish edilmiş workflow + production webhook URL) tetiklenir, test modunda (Execute workflow / test URL) tetiklenmez.

### 4. Daily Order Summary
Google Sheets'teki siparişleri ürün bazında gruplayan raporlama akışı; ayrıca MCP üzerinden dışa açılmış.

**Zincirler:**
- `Manual Trigger` → `Get row(s) in sheet` → `Code in JavaScript` (ürün bazında `total_orders` ve `customers` gruplaması)
- `MCP Server Trigger` → Tools → `Call n8n Workflow Tool (gunluk_siparis_ozeti)` → aynı workflow'un `When Executed by Another Workflow` girişini tetikler → `Get row(s) in sheet` → `Code in JavaScript`

Bu sayede workflow, bir MCP istemcisi (örn. Claude) tarafından "günlük sipariş özetini getir" şeklinde bir araç olarak çağrılabilir.

### 5. RAG - Ürün Rehberi Chatbot (Doküman Ekleme)
Ürün bakım rehberi dokümanlarını chunk'layıp Simple Vector Store'a ekleyen workflow.

**Zincir (her doküman için ayrı dal, aynı Manual Trigger'dan):**
`Manual Trigger` → `Edit Fields` (`content`, opsiyonel `product_name`) → `Simple Vector Store` (Operation: Add documents to vector store)
- **Embedding**: Embeddings Google Gemini (`models/embedding-001` — `text-embedding-004` bu API sürümünde çalışmıyor, dikkat)
- **Document**: Default Data Loader (Type: JSON, kaynak: `{{ $json.content }}`)
- **Text Splitter**: Recursive Character Text Splitter (Chunk Size: 400, Overlap: 50)
- **Metadata** (ikinci doküman için): Default Data Loader → Options → Metadata → `product: {{ $json.product_name }}`

Şu ana kadar eklenen dokümanlar: Seramik Kupa Bakım Rehberi, Gümüş Kolye Bakım Rehberi (metadata: `product` alanı ile etiketli).

**Memory Key**: `vector_store_key` — doküman ekleme ve sorgulama workflow'larında aynı olmalı.

### 6. Ürün Rehberi Chatbot (Sorgulama)
Ziyaretçilerin ürünler hakkında soru sorabildiği, Redis destekli hafızalı chatbot.

**Zincir:**
`When chat message received` → `AI Agent`
- **Chat Model**: Google Gemini Chat Model
- **Memory**: Redis Chat Memory (credential: host `redis`, port `6379`; Session Key: `{{ $json.sessionId }}` — her ziyaretçi oturumu ayrı hafızada tutulur)
- **Tool**: Simple Vector Store (Operation: Retrieve Documents (As Tool for AI Agent), aynı `vector_store_key`)

**Doğrulanan davranış:** Aynı oturumda önceki mesaj hatırlanıyor; yeni oturumda (session reset) hafıza sıfırlanıyor — ziyaretçi bazlı izolasyon çalışıyor.

## Bilinen Kısıtlar / Sonraki Adımlar

- Simple Vector Store kalıcı değil — prod'da Pinecone/Supabase gibi bir çözüme geçilmeli.
- Redis şifresiz ve tek container — prod'da parola + persistence (volume) eklenmeli.
- Google Sheets dosya okuma, Docker container'ın host dosya sistemine erişememesi nedeniyle önce `Edit Fields` ile metin yapıştırma yöntemiyle aşıldı; gerçek PDF/Word dosyalarıyla çalışmak için Docker volume mount gerekecek.
- Final Ödevi (BizCard Asistanı, teslim: 17 Eylül) için zorunlu parçalar: webhook, AI adımı, RAG, hafıza, hata ağı — bunların hepsi AtölyeKart'ta ayrı ayrı kanıtlanmış durumda; final için bunları tek, uçtan uca çalışan bir asistanda birleştirmek gerekiyor.

## Değişiklik Geçmişi (özet)

- Hafta 4: Code/Loop ile sipariş gruplama, AI Agent ile alternatif ürün önerisi, Sub-workflow + Error Handling.
- Hafta 5: RAG + Vector DB kurulumu, chatbot, ikinci doküman + metadata.
- Hafta 6: Redis chat history (ziyaretçi bazlı hafıza), MCP Server Trigger entegrasyonu, n8n API ile execution sorgulama.
