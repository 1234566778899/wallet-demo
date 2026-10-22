import { rpc, baseUrl } from './_lib/config.js';
import { sendPass } from './_lib/pass.js';

// GET /api/pass?t=<token del cliente> → descarga el .pkpass
export default async function handler(req, res) {
  const t = String(req.query.t || '');
  if (!/^[0-9a-f-]{36}$/i.test(t)) return res.status(400).send('Token inválido');
  try {
    const [c] = await rpc('tarjeta_por_token', { p_token: t });
    if (!c) return res.status(404).send('Tarjeta no encontrada');
    sendPass(res, c, `${baseUrl(req)}/api/wallet`);
  } catch (e) {
    console.error(e);
    res.status(500).send('No se pudo generar el pase');
  }
}
