# Kilden — Katalog ve Sipariş Akışını Expo (React Native) Uygulamasına Taşıma

## Amaç

Mevcut Vite + React web sitesi (`atolyekart-three.vercel.app`) canlı kalmaya devam ederken, aynı katalog/sipariş/stok-bildirimi akışının bir mobil (Expo) karşılığını oluşturmak. Web ve mobil, aynı `/api/order` backend'ini (JWT + rate-limit korumalı) paylaşır; iki frontend birbirinden bağımsızdır.

## Kapsam

- Aynı repoda yeni, bağımsız bir Expo projesi: `mobile/` (kendi `package.json`'ı, JavaScript — TypeScript yok).
- Taşınacak bileşenler: `ProductList`, `ProductCard`, `ProductImage`, `OrderForm` (Sipariş Ver), `StockNotifyForm` (Stok Bildirimi Iste).
- `src/data/products.js` içeriği mobile projesine kopyalanır (aynı ürün verisi, ayrı dosya — iki app farklı repo/klasör olduğu için paylaşılan paket kurulmaz, YAGNI).
- `lib/webhook.js` karşılığı: relative `/api/order` yerine tam URL (`EXPO_PUBLIC_API_BASE_URL` + `/api/order`) kullanır — Expo uygulaması Vercel ile aynı origin'de çalışmadığından.
- Aynı JWT `Authorization: Bearer` sözleşmesi (`EXPO_PUBLIC_API_TOKEN`), backend (`api/order.js`) hiç değişmez.

**Kapsam dışı** (bu turda taşınmayacak, kullanıcı onayı alındı):
- `CatalogQrCode` (dolayısıyla `react-native-qrcode-svg` bağımlılığı da bu turda eklenmiyor — CatalogQrCode ileride taşınırsa gündeme gelir).
- `PrivacyPolicy` ekranı — bu nedenle `OrderForm`'daki rıza checkbox'ı metniyle birlikte kalır, ama "Gizlilik Politikası" linki bu sürümde yok (bağlanacak gerçek bir ekran kapsam dışı olduğu için).
- Gerçek cihaz/simülatör testi (bu ortamda simülatör yok).
- Expo Router / çoklu ekran navigasyonu (tek ekran, local state toggle — web'deki desenle birebir).

## Araçlar

- `npx create-expo-app@latest mobile --template blank` (JavaScript, TypeScript değil).
- Ek bağımlılık yok (checkbox ve ürün seçici için native/community paket yerine `Pressable` tabanlı custom bileşenler — aşağıda gerekçeli).

## Dosya Yapısı

```
AtolyeKart/
├── src/...                        (mevcut web projesi, değişmez)
├── api/order.js                   (mevcut backend, değişmez — hem web hem mobile bunu kullanır)
├── mobile/
│   ├── App.js                      # header + <ProductList /> + <StockNotifyForm/> toggle + footer
│   ├── app.json
│   ├── package.json
│   ├── .env                        # EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_API_TOKEN (gitignore'da)
│   ├── .env.example
│   └── src/
│       ├── theme.js                # web'deki CSS custom property'lerle aynı renk paleti
│       ├── data/
│       │   └── products.js         # web'dekiyle aynı içerik (kopya)
│       ├── lib/
│       │   └── webhook.js          # tam URL ile POST, ayni {ok,error} sözleşmesi
│       └── components/
│           ├── ProductImage.js
│           ├── ProductCard.js
│           ├── ProductList.js
│           ├── OrderForm.js
│           └── StockNotifyForm.js
└── docs/superpowers/specs/2026-08-23-expo-migration-design.md (bu dosya)
```

## Veri Modeli — `mobile/src/data/products.js`

Web'deki `src/data/products.js` ile birebir aynı içerik (3 ürün, aynı `id/name/category/price/description/icon` alanları). Tek kaynak web tarafında kalır; mobile kopyası elle senkronize edilir (iki ayrı app, paylaşılan paket kurmak bu ölçekte gereksiz karmaşıklık).

## Ortam Değişkenleri — `mobile/.env`

Vite'ın `VITE_*` önekinin Expo karşılığı `EXPO_PUBLIC_*`:

```
EXPO_PUBLIC_API_BASE_URL=https://atolyekart-three.vercel.app
EXPO_PUBLIC_API_TOKEN=<web'deki VITE_API_TOKEN ile aynı değer>
```

`.env.example` gerçek değer olmadan aynı iki değişkeni şablon olarak listeler.

## Bileşenler

### `ProductImage.js`
- Props: `{ icon, category }`.
- `View` (yuvarlak, sabit boyut, `theme` renkleriyle) içinde `Text` ile emoji ikon ortalanır; `accessibilityLabel={category}` `accessibilityRole="image"`.
- `Image` component'i **kullanılmıyor** — `icon` alanı zaten bir emoji string'i (gerçek görsel dosyası yok). İleride gerçek ürün fotoğrafı eklenirse bu bileşenin içi `Image`'a geçecek şekilde genişletilebilir; `ProductCard`'ın arayüzü (prop olarak `product` almak) değişmez.

### `ProductCard.js`
- Props: `{ product }`.
- `View` kart (`theme.card` stiliyle) → `ProductImage` → ürün adı/fiyat/açıklama `Text`'leri → "Sipariş Ver" `Pressable`.
- Yerel state: `showOrderForm` (boolean). `true` olunca buton yerine `<OrderForm productName={product.name} />` kartın içinde render edilir (web'deki toggle deseniyle birebir).

### `ProductList.js`
- Yerel state: `activeCategory` (web'deki `ProductList.jsx` ile birebir aynı mantık).
- Kategori filtreleri: `Pressable` "chip" butonlar (`Tümü/Seramik/Ahşap/Takı`), aktif olan `theme.accent` arka planla vurgulanır.
- Ürünler `ScrollView` içinde `.map()` ile render edilir (3 sabit ürün — `FlatList` virtualization gerektirmeyecek kadar küçük liste, KISS).

### `OrderForm.js`
- State: `name, phone, consent, status, error` (web'deki `OrderForm.jsx` ile birebir aynı state modeli, `showPrivacyPolicy` hariç — kapsam dışı).
- `TextInput`: Ad Soyad, Telefon (`keyboardType="phone-pad"`).
- Ürün adı: düzenlenemez `Text` (web'deki `readOnly disabled input` karşılığı).
- Rıza checkbox'ı: native bir checkbox RN core'da yok; ek bağımlılık eklemeden `Pressable` + kare `View` (işaretliyken dolgu/tik) ile custom checkbox. Aynı metin ("Adım, telefon numaram ve sipariş bilgilerimin bu talebi işlemek amacıyla işlenmesini kabul ediyorum.") — link olmadan (kapsam dışı gerekçesiyle yukarıda açıklandı).
- Gönder butonu: `Pressable`/`Button`, `disabled={status === "sending" || !consent}` — web'deki mantığın birebir aynısı.
- `handleSubmit`: `sendToWebhook({ type: "order", name, product: productName, phone })` — payload sözleşmesi değişmez.

### `StockNotifyForm.js`
- State: `name, email, product, status, error` (web'deki ile birebir aynı, `EMAIL_PATTERN` regex'i aynen taşınır).
- Ürün seçimi: web'deki `<select>` yerine, `ProductList`'teki kategori-chip deseniyle tutarlı bir `Pressable` ürün seçici (3 ürün adı arasında seçim) — `@react-native-picker/picker` gibi ek bir bağımlılık eklenmez.
- `TextInput`: Ad Soyad, E-posta (`keyboardType="email-address"`, `autoCapitalize="none"`).
- Gönder: aynı `EMAIL_PATTERN.test()` doğrulaması, aynı `sendToWebhook({ type: "stock_notify", name, email, product })` payload'ı.

### `App.js`
- Header (başlık + alt başlık, web'dekiyle aynı metin) → `<ProductList />` → alt kısımda "Stok Bildirimi Iste" butonu / toggle (web'deki `App.jsx`'teki `showStockForm` deseniyle birebir) → footer.

## Veri Akışı

Web'dekiyle birebir aynı zincir: `products.js` → `ProductList` (filtre + map) → `ProductCard` (prop: `product`) → `ProductImage` (prop: `icon, category`) / `OrderForm` (prop: `productName`). Formlar kendi local state'lerini tutar, veri `sendToWebhook` ile dışarı çıkar. Fetch artık tam URL'e gider; JWT doğrulama ve rate-limit backend'de (`api/order.js`) değişmeden kalır.

## Hata Yönetimi

`lib/webhook.js` web'deki `sendToWebhook` ile aynı sözleşmeyi korur: `{ ok: true }` veya `{ ok: false, error: "Bağlantı hatası, lütfen tekrar deneyin." }`. `EXPO_PUBLIC_API_TOKEN` tanımsızsa aynı şekilde console uyarısı + `{ ok: false, error }` döner (web'deki guard'ın birebir karşılığı).

## Stil

- `mobile/src/theme.js`: web'in `index.css`'teki CSS custom property'leriyle aynı renk paleti (`bg, cardBg, text, textMuted, accent, accentDark, border`) sabit değerler olarak export edilir.
- Her bileşen kendi `StyleSheet.create({...})` bloğunu kullanır (RN konvansiyonu); ortak tema `theme.js`'den import edilir.

## Doğrulama

- Bu ortamda simülatör/fiziksel cihaz yok — otomatik/manuel UI testi yapılamıyor.
- `npx expo-doctor` ile proje sağlığı kontrol edilecek.
- `npx expo export` (headless bundling, cihaz gerektirmez) ile JS/bundle'ın hatasız derlendiği doğrulanacak.
- Gerçek cihazda görsel/etkileşim testi kullanıcıya bırakılıyor (Expo Go ile `npx expo start` sonrası QR kod okutarak).

## Kapsam Dışı / Sonraki Adımlar (bilgi amaçlı, bu spec'in parçası değil)

- `CatalogQrCode`'un `react-native-qrcode-svg` ile taşınması.
- `PrivacyPolicy` ekranının taşınması ve `OrderForm`'daki linkin geri eklenmesi.
- Expo Router ile çoklu ekran navigasyonu.
- iOS/Android build & store dağıtımı (EAS Build).
