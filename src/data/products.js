// Her ürün kaydı aşağıdaki alanları içermelidir:
//   id          — string, benzersiz tanımlayıcı (örn. "seramik-kupa")
//   name        — string, ürünün görünen adı
//   category    — string, "seramik" | "ahsap" | "taki"
//   price       — number, TL cinsinden fiyat
//   description — string, kısa ürün açıklaması
//   icon        — string, ürünü temsil eden tek bir emoji
//
// Kategoriye göre fiyat aralıkları (CLAUDE.md ile aynı olmalı):
//   seramik: 300–800 TL
//   ahşap:   400–900 TL
//   takı:    500–1200 TL
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
