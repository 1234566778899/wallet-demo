import { rpc, baseUrl, PASS_TYPE_ID } from './_lib/config.js';
import { sendPass } from './_lib/pass.js';

// Web service de Apple Wallet: https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes
// vercel.json reescribe /api/wallet/<ruta> → /api/wallet?path=<ruta>
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const parts = String(req.query.path || '').split('/').filter(Boolean);
  const auth = String(req.headers.authorization || '').replace(/^ApplePass\s+/i, '');
  const [v1, kind, a, b, c, d] = parts;
  if (v1 !== 'v1') return res.status(404).end();

  try {
    // POST /v1/log
    if (kind === 'log') { console.log('[wallet log]', JSON.stringify(req.body)); return res.status(200).end(); }

    // GET /v1/passes/:passTypeId/:serial
    if (kind === 'passes' && req.method === 'GET') {
      if (a !== PASS_TYPE_ID || !UUID.test(b || '')) return res.status(401).end();
      const [cl] = await rpc('wallet_pase', { p_serial: b, p_auth: auth });
      if (!cl) return res.status(401).end();
      const since = req.headers['if-modified-since'];
      if (since && Math.floor(new Date(cl.updated_at) / 1000) <= Math.floor(new Date(since) / 1000)) return res.status(304).end();
      return sendPass(res, cl, `${baseUrl(req)}/api/wallet`);
    }

    // /v1/devices/:deviceId/registrations/:passTypeId[/:serial]
    if (kind === 'devices' && b === 'registrations') {
      if (c !== PASS_TYPE_ID) return res.status(404).end();
      if (!d && req.method === 'GET') {
        const since = req.query.passesUpdatedSince;
        const rows = await rpc('wallet_seriales', { p_device: a, p_since: since && !isNaN(Date.parse(since)) ? since : null });
        if (!rows.length) return res.status(204).end();
        const last = rows.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), rows[0].updated_at);
        return res.status(200).json({ serialNumbers: rows.map(r => r.serial), lastUpdated: last });
      }
      if (!UUID.test(d || '')) return res.status(401).end();
      if (req.method === 'POST') {
        const r = await rpc('wallet_registrar', { p_device: a, p_serial: d, p_auth: auth, p_push: req.body?.pushToken || '' });
        return res.status(r === 'created' ? 201 : r === 'exists' ? 200 : 401).end();
      }
      if (req.method === 'DELETE') {
        const ok = await rpc('wallet_baja', { p_device: a, p_serial: d, p_auth: auth });
        return res.status(ok ? 200 : 401).end();
      }
    }
    res.status(404).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
}
