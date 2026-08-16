# Kilden — Statik Siteyi Vite + React'e Dönüştürme

## Amaç

Mevcut tek dosyalık `index.html` (Kilden atölyesi tanıtım sayfası) yerine, aynı görsel tasarımı koruyan bir Vite + React projesi kurmak. Ürün listesi bileşenlere ve ayrı bir veri dosyasına bölünecek; böylece ileride ürün ekleme/düzenleme kod değişikliği gerektirmeden `products.js` üzerinden yapılabilecek.

## Kapsam

- Vite + React (JavaScript, `.jsx`) proje iskeleti, mevcut dizinde (`C:\Users\HP\AtolyeKart`).
- `ProductImage`, `ProductCard`, `ProductList` bileşenleri, her biri `src/components/` altında ayrı dosya.
- Ürün verisi `src/data/products.js` içinde.
- Mevcut tasarımın (renkler, fontlar, price tag görünümü, header/footer) birebir korunması.
- Eski statik `index.html` silinecek (Vite kendi `index.html`'ini kullanacak).

Kapsam dışı: gerçek ürün fotoğrafları (yerine ikon/emoji placeholder), otomatik testler, backend/API entegrasyonu, deploy/hosting kurulumu.

## Araçlar

- Paket yöneticisi: npm (mevcut ortamda npm 11.16.0 kurulu).
- Şablon: `npm create vite@latest . -- --template react` (JavaScript varyantı, TypeScript değil).
- Node: v24.18.0 (mevcut kurulum), ek bir sürüm yönetimi gerekmiyor.

## Dosya Yapısı

```
AtolyeKart/
├── index.html            (Vite tarafından oluşturulan giriş noktası)
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx           # React'i mount eder
│   ├── App.jsx             # header + <ProductList /> + footer
│   ├── index.css           # mevcut tasarımın taşındığı global stiller
│   ├── data/
│   │   └── products.js     # ürün verisi (export const products = [...])
│   └── components/
│       ├── ProductImage.jsx
│       ├── ProductCard.jsx
│       └── ProductList.jsx
├── CLAUDE.md              (mevcut, değişmeyecek)
└── docs/superpowers/specs/2026-08-16-react-conversion-design.md (bu dosya)
```

`index.static.html` gibi bir yedek tutulmayacak — eski statik dosya silinecek (kullanıcı onayı alındı).

## Veri Modeli — `src/data/products.js`

```js
export const products = [
  {
    id: "seramik-kupa",
    name: "Seramik Kupa",
    category: "seramik",
    price: 450,
    description: "Elde şekillendirilmiş, sırlı seramikten günlük kullanım kupası.",
    icon: "🏺",
  },
  {
    id: "ceviz-kesme-tahtasi",
    name: "Ceviz Kesme Tahtası",
    category: "ahsap",
    price: 620,
    description: "Doğal ceviz ağacından, özenle işlenmiş mutfak kesme tahtası.",
    icon: "🪵",
  },
  {
    id: "gumus-kolye",
    name: "Gümüş Kolye",
    category: "taki",
    price: 780,
    description: "925 ayar gümüşten, el işçiliğiyle üretilmiş özgün kolye.",
    icon: "💍",
  },
];
```

Fiyat sayısal (`TL` eki bileşen içinde eklenir, veri katmanında değil) — böylece ileride para birimi/format değişikliği tek yerden yönetilir.

## Bileşenler

### `ProductImage.jsx`
- Props: `{ icon, category }`.
- Sabit boyutlu (örn. 96×96px), mevcut kart rengiyle uyumlu (`--border` arka plan, yuvarlatılmış köşe) bir kutu içinde `icon` emojisini ortalar.
- `category` şu an sadece `alt`/`aria-label` benzeri erişilebilirlik metni için kullanılır (örn. `role="img" aria-label={category}`).
- Gerçek görsele geçiş gerektiğinde bu bileşenin içi değişecek, `ProductCard`'ın arayüzü (prop olarak `product` almak) etkilenmeyecek.

### `ProductCard.jsx`
- Props: `{ product }`.
- Render sırası: `<ProductImage icon={product.icon} category={product.category} />` → ürün adı (`h2`) → fiyat etiketi (`{product.price} TL`, mevcut `.price` stiliyle) → açıklama (`.desc`).
- Mevcut `.product-card` CSS sınıfı korunur.

### `ProductList.jsx`
- Props yok; `products.js`'den `products` dizisini import eder.
- Mevcut `.products` grid sarmalayıcısı içinde `products.map(p => <ProductCard key={p.id} product={p} />)` render eder.

### `App.jsx`
- Mevcut `<header>` (başlık + alt başlık) ve `<footer>` içeriğini birebir taşır, ortasında `<ProductList />`.

## Veri Akışı

Tek yönlü: `products.js` → `ProductList` (map) → `ProductCard` (prop: `product`) → `ProductImage` (prop: `icon`, `category`). State yok; tamamen statik/deterministik render.

## Stil

- Mevcut `index.html`'deki `<style>` bloğu (CSS custom property'ler, header/footer, `.products` grid, `.product-card`, `.price`, `.desc`, `footer` kuralları) `src/index.css`'e birebir taşınır ve `main.jsx`'te import edilir.
- Yeni eklenen tek kural: `.product-image` (ProductImage'ın kutusu) — mevcut palete uyumlu (`--border` arka plan, `--accent-dark` ikon/metin rengi), kart üstünde ortalanmış.
- Font ve renk değişkenleri değişmeyecek.

## Doğrulama

- `npm run dev` ile geliştirme sunucusu başlatılır, sayfa tarayıcıda açılıp:
  - 3 ürünün ikon, ad, fiyat (TL etiketiyle) ve açıklamayla birlikte doğru sırada göründüğü,
  - Renk paleti, font, kart/price-tag görünümünün eski statik sayfayla aynı olduğu
  manuel olarak kontrol edilir.
- Otomatik test kapsam dışı (kullanıcı onayı alındı) — proje küçük ve tamamen statik/deterministik olduğu için manuel görsel kontrol yeterli kabul edildi.

## Kapsam Dışı / Sonraki Adımlar (bilgi amaçlı, bu spec'in parçası değil)

- Gerçek ürün fotoğrafları eklenmesi (ProductImage'ın `<img>` kullanacak şekilde genişletilmesi).
- Ürün ekleme/düzenleme için bir yönetim arayüzü veya CMS entegrasyonu.
- Deploy/hosting kurulumu.
