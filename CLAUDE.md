# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje Özeti

Kilden, el sanatları/zanaat atölyesi için tek sayfalık tanıtım sitesi. Proje Vite + React (JavaScript, `.jsx` — TypeScript yok) ile kuruludur. Geliştirme için `npm install` ardından `npm run dev`; production build için `npm run build` (çıktı `dist/` klasörüne yazılır).

Bileşen zinciri: `ProductList` → `ProductCard` → `ProductImage`. `ProductList`, `src/data/products.js` içindeki her kayıt için bir `ProductCard` render eder.

Yeni ürün eklemek veya mevcut bir ürünü değiştirmek için düzenlenmesi gereken dosya `src/data/products.js`. Her ürün kaydı şu alanları içermeli: `id, name, category, price, description, icon`.

## Sektör ve Hedef Kitle

- **Sektör:** El sanatları / zanaat atölyesi — seramik, ahşap, takı.
- **Hedef kitle:** Bireysel hobi meraklıları; seri üretim değil, otantik/el yapımı ürüne değer veren kişiler. İçerik ve ton buna göre kurulmalı (örn. "seri üretim", "toptan", "endüstriyel" gibi ifadelerden kaçınılmalı; el işçiliği, özgünlük, doğal malzeme vurgusu öne çıkarılmalı).

## Ürün Kategorileri ve Fiyat Aralıkları

| Kategori | Fiyat Aralığı |
|---|---|
| Seramik | 300–800 TL |
| Ahşap | 400–900 TL |
| Takı | 500–1200 TL |

Yeni ürün eklerken fiyatın ilgili kategorinin aralığı içinde kalmasına dikkat edilmeli; aralık dışına çıkan bir fiyat varsa bunu kullanıcıya bildirin.
