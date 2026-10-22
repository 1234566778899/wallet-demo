import { PKPass } from 'passkit-generator';
import { PASS_TYPE_ID, TEAM_ID, META, readAsset, certs } from './config.js';

const fixed = ['icon.png', 'icon@2x.png', 'icon@3x.png', 'logo.png', 'logo@2x.png', 'logo@3x.png'];

export function buildPass(c, webServiceURL) {
  const n = Math.min(c.sellos, META);
  const full = n >= META;
  const json = {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_ID,
    teamIdentifier: TEAM_ID,
    serialNumber: c.id,
    authenticationToken: c.pass_auth,
    webServiceURL,
    organizationName: 'Barbería El Filo',
    description: 'Tarjeta de fidelidad Barbería El Filo',
    logoText: 'Barbería El Filo',
    backgroundColor: 'rgb(17,17,19)',
    foregroundColor: 'rgb(245,245,247)',
    labelColor: 'rgb(201,162,39)',
    storeCard: {
      headerFields: [{ key: 'sellos', label: 'SELLOS', value: `${n}/${META}`, changeMessage: 'Ahora tienes %@ sellos ✂️' }],
      secondaryFields: [{ key: 'cliente', label: 'CLIENTE', value: c.nombre }],
      auxiliaryFields: [
        { key: 'premio', label: 'CORTE GRATIS', value: full ? '¡Ya es tuyo!' : `Faltan ${META - n}`, textAlignment: 'PKTextAlignmentRight', changeMessage: '%@' },
      ],
      backFields: [
        { key: 'visitas', label: 'Visitas totales', value: c.total_visitas },
        { key: 'gratis', label: 'Cortes gratis canjeados', value: c.cortes_gratis },
        { key: 'como', label: '¿Cómo funciona?', value: `Muestra este QR cada vez que te cortes el pelo. Al juntar ${META} sellos tu siguiente corte es gratis.` },
        { key: 'codigo', label: 'Código de cliente', value: c.codigo },
      ],
    },
  };

  const files = Object.fromEntries(fixed.map(f => [f, readAsset(f)]));
  for (const s of ['', '@2x', '@3x']) files[`strip${s}.png`] = readAsset(`strip_${n}${s}.png`);
  files['pass.json'] = Buffer.from(JSON.stringify(json));

  const pass = new PKPass(files, certs());
  pass.setBarcodes({ message: c.codigo, format: 'PKBarcodeFormatQR', messageEncoding: 'iso-8859-1', altText: c.codigo });
  return pass.getAsBuffer();
}

export function sendPass(res, c, webServiceURL) {
  res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
  res.setHeader('Content-Disposition', 'attachment; filename="elfilo.pkpass"');
  res.setHeader('Last-Modified', new Date(c.updated_at).toUTCString());
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(buildPass(c, webServiceURL));
}
