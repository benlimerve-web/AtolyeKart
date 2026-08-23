export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="privacy-policy">
      <h2>Gizlilik Politikası</h2>

      <h3>Hangi veriler toplanıyor?</h3>
      <p>
        Sipariş Ver ve Stok Bildirimi Iste formlarını doldurduğunuzda ad
        soyad, telefon numarası ve/veya e-posta adresinizi topluyoruz.
      </p>

      <h3>Bu veriler neden toplanıyor?</h3>
      <p>
        Bu bilgiler yalnızca ilettiğiniz sipariş veya stok bildirimi talebini
        işleme almak ve talebinizle ilgili sizinle iletişime geçmek amacıyla
        kullanılır.
      </p>

      <h3>Verileriniz nerede saklanıyor?</h3>
      <p>
        Form bilgileriniz, talebinizi işleyebilmemiz için sunucumuz
        üzerinden üçüncü taraf bir bildirim sistemine (webhook) iletilir ve
        orada saklanır. Bilgileriniz bu amaç dışında başka bir yerde
        depolanmaz veya üçüncü bir tarafla paylaşılmaz.
      </p>

      <h3>Haklarınız</h3>
      <p>
        Tarafımıza ilettiğiniz verilerin silinmesini talep etme hakkınız
        vardır. Bu talebiniz için bize{" "}
        <a href="mailto:[iletisim-eposta-buraya]">
          [iletişim e-postası buraya]
        </a>{" "}
        adresinden ulaşabilirsiniz.
      </p>

      <button type="button" onClick={onBack}>
        Geri
      </button>
    </div>
  );
}
