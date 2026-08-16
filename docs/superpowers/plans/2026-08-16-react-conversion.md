# Kilden React Dönüşümü Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut statik `index.html` (Kilden atölyesi tanıtım sayfası) yerine, aynı görsel tasarımı koruyan bir Vite + React projesi kurmak; ürün listesini `ProductList` → `ProductCard` → `ProductImage` bileşen zincirine ve `src/data/products.js` veri dosyasına bölmek.

**Architecture:** Vite + React (JavaScript, `.jsx`) tek sayfalık uygulama. Tek yönlü veri akışı: `products.js` → `ProductList` (map) → `ProductCard` (prop: `product`) → `ProductImage` (prop: `icon`, `category`). State yok, tamamen statik/deterministik render. Stil tek global `src/index.css` dosyasında.

**Tech Stack:** Node v24.18.0, npm 11.16.0, Vite (react template), React 18/19 (template varsayılanı), JavaScript (`.jsx`), git.

**Spec:** `docs/superpowers/specs/2026-08-16-react-conversion-design.md`

## Global Constraints

- Dil: JavaScript (`.jsx`), TypeScript kullanılmayacak.
- Paket yöneticisi: npm.
- CSS: tek global dosya (`src/index.css`), CSS Modules kullanılmayacak.
- Ürün görseli: gerçek fotoğraf yok — `ProductImage` kategoriye göre emoji ikon gösterir (🏺 seramik, 🪵 ahşap, 💍 takı).
- Mevcut tasarım (renkler, fontlar, price tag görünümü, header/footer) birebir korunacak.
- Eski statik `index.html` silinecek, yedek tutulmayacak.
- Otomatik test kapsam dışı (kullanıcı onayı alındı); doğrulama `npm run build` ve bundle içeriği kontrolü ile yapılacak.
- Proje kökünde git deposu başlatılacak, her görev sonunda commit atılacak.

---

### Task 1: Git deposunu başlat ve mevcut dosyaları commit'le

**Files:**
- Create: `.git/` (git init ile)
- Modify: yok

**Interfaces:**
- Consumes: yok
- Produces: bir git deposu (sonraki tüm task'lar bunun üzerine commit atar)

- [ ] **Step 1: Git deposunu başlat**

Run: `cd "C:/Users/HP/AtolyeKart" && git init`
Expected: "Initialized empty Git repository in .../AtolyeKart/.git/"

- [ ] **Step 2: Mevcut dosyaları stage'le ve commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "chore: mevcut statik Kilden sitesini ilk commit olarak ekle"
```
Expected: commit başarıyla oluşturulur (index.html, CLAUDE.md, docs/ dahil).

- [ ] **Step 3: Commit'i doğrula**

Run: `git log --oneline -1`
Expected: bir satır commit hash + mesaj görünür.

---

### Task 2: Vite + React iskeletini kur ve projeye entegre et

**Files:**
- Create (geçici): `_vite_scaffold/` (Vite'ın oluşturduğu tüm dosyalar)
- Create (proje köküne taşınacak): `package.json`, `vite.config.js`, `.gitignore`, `index.html` (Vite'ın varsayılanı, üzerine yazılacak), `public/vite.svg`, `src/main.jsx`, `src/App.jsx` (Vite varsayılan içeriği — Task 7'de değiştirilecek), `src/App.css` (Vite varsayılanı — Task 7'de silinecek), `src/index.css` (Vite varsayılanı — Task 7'de değiştirilecek), `src/assets/react.svg` (Vite varsayılanı — Task 7'de silinecek)
- Delete: eski statik `index.html` (Vite'ın kendi index.html'i ile üzerine yazılarak silinmiş olur)
- Modify: `index.html` (title, lang, meta description güncellenecek)

**Interfaces:**
- Consumes: yok
- Produces: çalışan bir `npm run build` pipeline'ı; `src/main.jsx` içinde `import './index.css'` ve `import App from './App.jsx'` satırları (sonraki task'lar bu dosyaları değiştirecek, main.jsx'e dokunmayacak)

- [ ] **Step 1: Vite React şablonunu geçici bir dizine oluştur**

Run:
```bash
cd "C:/Users/HP/AtolyeKart"
npm exec --yes create-vite@latest _vite_scaffold -- --template react
```
Expected: `_vite_scaffold/` altında `package.json`, `vite.config.js`, `index.html`, `src/`, `public/` oluşur. Hedef dizin boş olduğu için interaktif prompt çıkmaz.

- [ ] **Step 2: Oluşturulan dosyaları proje köküne taşı**

```bash
cd "C:/Users/HP/AtolyeKart"
cp -r _vite_scaffold/. ./
rm -rf _vite_scaffold
```
Expected: `package.json`, `vite.config.js`, `src/`, `public/` proje kökünde belirir; eski statik `index.html` Vite'ın `index.html`'i ile üzerine yazılır.

- [ ] **Step 3: `index.html` başlık ve dil bilgisini güncelle**

`index.html` içeriğini şu şekilde düzenle (tamamını bu içerikle değiştir):

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Kilden - El yapımı seramik, ahşap ve gümüş ürünler atölyesi" />
    <title>Kilden</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Bağımlılıkları kur**

Run: `cd "C:/Users/HP/AtolyeKart" && npm install`
Expected: `node_modules/` oluşur, hata olmadan tamamlanır.

- [ ] **Step 5: Build'in çalıştığını doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: `dist/` klasörü oluşur, hata çıkmaz (Vite'ın varsayılan sayaç uygulaması build edilir).

- [ ] **Step 6: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "chore: vite+react iskeletini kur"
```

---

### Task 3: Ürün veri dosyasını oluştur

**Files:**
- Create: `src/data/products.js`

**Interfaces:**
- Consumes: yok
- Produces: `export const products` — dizi elemanları `{ id: string, name: string, category: string, price: number, description: string, icon: string }` şeklinde (Task 6'daki `ProductList` bunu import edecek)

- [ ] **Step 1: `src/data/products.js` dosyasını oluştur**

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

- [ ] **Step 2: Build'in hâlâ hatasız çalıştığını doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: hatasız tamamlanır (dosya henüz hiçbir yerde import edilmiyor, ama geçerli JS olduğu için build'i bozmaz).

- [ ] **Step 3: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "feat: urun veri dosyasini ekle (src/data/products.js)"
```

---

### Task 4: `ProductImage` bileşenini oluştur

**Files:**
- Create: `src/components/ProductImage.jsx`

**Interfaces:**
- Consumes: yok
- Produces: `export default function ProductImage({ icon, category })` — Task 5'teki `ProductCard` bunu `<ProductImage icon={...} category={...} />` şeklinde kullanacak

- [ ] **Step 1: `src/components/ProductImage.jsx` dosyasını oluştur**

```jsx
export default function ProductImage({ icon, category }) {
  return (
    <div className="product-image" role="img" aria-label={category}>
      <span aria-hidden="true">{icon}</span>
    </div>
  );
}
```

- [ ] **Step 2: Build'in hâlâ hatasız çalıştığını doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: hatasız tamamlanır (dosya henüz import edilmiyor).

- [ ] **Step 3: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "feat: ProductImage bilesenini ekle"
```

---

### Task 5: `ProductCard` bileşenini oluştur

**Files:**
- Create: `src/components/ProductCard.jsx`

**Interfaces:**
- Consumes: `ProductImage` — `import ProductImage from "./ProductImage"`, `<ProductImage icon={string} category={string} />` (Task 4'te tanımlandı)
- Produces: `export default function ProductCard({ product })` — Task 6'daki `ProductList` bunu `<ProductCard key={product.id} product={product} />` şeklinde kullanacak. `product` şekli Task 3'teki `products` elemanlarıyla aynı: `{ id, name, category, price, description, icon }`.

- [ ] **Step 1: `src/components/ProductCard.jsx` dosyasını oluştur**

```jsx
import ProductImage from "./ProductImage";

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <ProductImage icon={product.icon} category={product.category} />
      <h2>{product.name}</h2>
      <p className="price">{product.price} TL</p>
      <p className="desc">{product.description}</p>
    </div>
  );
}
```

- [ ] **Step 2: Build'in hâlâ hatasız çalıştığını doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: hatasız tamamlanır.

- [ ] **Step 3: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "feat: ProductCard bilesenini ekle"
```

---

### Task 6: `ProductList` bileşenini oluştur

**Files:**
- Create: `src/components/ProductList.jsx`

**Interfaces:**
- Consumes: `products` — `import { products } from "../data/products"` (Task 3'te tanımlandı); `ProductCard` — `import ProductCard from "./ProductCard"`, `<ProductCard product={object} />` (Task 5'te tanımlandı)
- Produces: `export default function ProductList()` — Task 7'deki `App.jsx` bunu `<ProductList />` şeklinde kullanacak

- [ ] **Step 1: `src/components/ProductList.jsx` dosyasını oluştur**

```jsx
import { products } from "../data/products";
import ProductCard from "./ProductCard";

export default function ProductList() {
  return (
    <div className="products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build'in hâlâ hatasız çalıştığını doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: hatasız tamamlanır.

- [ ] **Step 3: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "feat: ProductList bilesenini ekle"
```

---

### Task 7: `App.jsx` ve `index.css`'i bağla, eski varsayılan dosyaları temizle

**Files:**
- Modify: `src/App.jsx` (Vite varsayılan içeriğinin tamamı yerine yeni içerik), `src/index.css` (Vite varsayılan içeriğinin tamamı yerine mevcut tasarımın taşınmış hâli)
- Delete: `src/App.css`, `src/assets/react.svg` (Vite varsayılanları, artık kullanılmıyor)

**Interfaces:**
- Consumes: `ProductList` — `import ProductList from "./components/ProductList"` (Task 6'da tanımlandı)
- Produces: nihai render edilen sayfa (bu son task, kendisini kullanan başka bir task yok)

- [ ] **Step 1: `src/App.css` ve `src/assets/react.svg` dosyalarını sil**

```bash
cd "C:/Users/HP/AtolyeKart"
rm -f src/App.css src/assets/react.svg
```

- [ ] **Step 2: `src/App.jsx` içeriğini değiştir**

Dosyanın tamamını şu içerikle değiştir:

```jsx
import ProductList from "./components/ProductList";

export default function App() {
  return (
    <>
      <header>
        <h1>Kilden</h1>
        <p>El Yapımı Seramik ve Doğal Malzeme Atölyesi</p>
      </header>

      <main>
        <ProductList />
      </main>

      <footer>
        Kilden &copy; 2026
      </footer>
    </>
  );
}
```

- [ ] **Step 3: `src/index.css` içeriğini değiştir**

Dosyanın tamamını şu içerikle değiştir:

```css
:root {
  --bg: #f7f1e8;
  --card-bg: #fffaf2;
  --text: #3b2a1e;
  --text-muted: #7a6a58;
  --accent: #b5651d;
  --accent-dark: #6b4226;
  --border: #e4d5c1;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.6;
}

header {
  text-align: center;
  padding: 64px 24px 40px;
}

header h1 {
  margin: 0;
  font-size: 3rem;
  letter-spacing: 0.04em;
  color: var(--accent-dark);
}

header p {
  margin: 12px 0 0;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.05rem;
  color: var(--text-muted);
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.product-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 28px 24px;
  text-align: center;
}

.product-image {
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--border);
  border-radius: 50%;
  font-size: 2.5rem;
  color: var(--accent-dark);
}

.product-card h2 {
  margin: 0 0 8px;
  font-size: 1.4rem;
  color: var(--accent-dark);
}

.price {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--accent);
  margin: 0 0 12px;
}

.product-card p.desc {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

footer {
  text-align: center;
  padding: 24px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
}
```

- [ ] **Step 4: Build'i çalıştır**

Run: `cd "C:/Users/HP/AtolyeKart" && npm run build`
Expected: hatasız tamamlanır, `dist/assets/` altında bir `.js` bundle dosyası oluşur.

- [ ] **Step 5: Bundle içeriğinde ürün verisinin gerçekten göründüğünü doğrula**

Run: `cd "C:/Users/HP/AtolyeKart" && grep -l "Seramik Kupa" dist/assets/*.js`
Expected: en az bir dosya yolu döner (ürün adı bundle'a gömülmüş demektir). Aynı şekilde `grep -l "450" dist/assets/*.js` de bir sonuç döndürmeli.

- [ ] **Step 6: Commit'le**

```bash
cd "C:/Users/HP/AtolyeKart"
git add -A
git commit -m "feat: App ve index.css'i bilesen agacina bagla, eski Vite varsayilanlarini temizle"
```

- [ ] **Step 7: (Bilgi amaçlı, otomatik değil) İnsan tarafından görsel kontrol**

Bu adım checkbox olarak işaretlenebilir ama komut çalıştırmaz — sadece bir hatırlatmadır: kullanıcı `npm run dev` çalıştırıp tarayıcıda açarak sayfanın eski statik tasarımla (renkler, fontlar, price tag görünümü) birebir aynı olduğunu gözle teyit etmeli.

---

## Self-Review Notları

- **Spec kapsaması:** Spec'teki tüm bölümler (araçlar, dosya yapısı, veri modeli, bileşenler, veri akışı, stil, doğrulama) Task 1–7 arasında karşılanıyor.
- **Placeholder taraması:** Tüm adımlarda gerçek kod/komut var, "TODO"/"benzer şekilde" yok.
- **Tip/isim tutarlılığı:** `product.id`, `product.name`, `product.category`, `product.price`, `product.description`, `product.icon` alan adları Task 3, 5 ve 6'da birebir aynı kullanılıyor; `ProductImage`'ın `icon`/`category` prop adları Task 4 ve 5'te eşleşiyor.
