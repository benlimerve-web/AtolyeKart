import { QRCodeSVG } from "qrcode.react";

function CatalogQrCode({ url }) {
  return (
    <div className="catalog-qr">
      <QRCodeSVG value={url} size={160} marginSize={2} />
      <p>Katalogu telefonunuzla görüntülemek için QR kodu okutun</p>
    </div>
  );
}

export default CatalogQrCode;
