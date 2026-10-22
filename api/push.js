import http2 from 'node:http2';
import { rpc, certs, PASS_TYPE_ID } from './_lib/config.js';

// POST /api/push { codigo } con la sesión del barbero → avisa a los iPhone del cliente que su pase cambió
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const jwt = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let tokens;
  try {
    tokens = await rpc('push_tokens', { p_codigo: String(req.body?.codigo || '') }, jwt);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  if (!tokens.length) return res.json({ sent: 0 });

  const { signerCert, signerKey } = certs();
  const apns = http2.connect('https://api.push.apple.com', { cert: signerCert, key: signerKey });
  apns.on('error', e => console.error('[apns]', e.message));
  const statuses = await Promise.all(tokens.map(t => new Promise(resolve => {
    const r = apns.request({ ':method': 'POST', ':path': `/3/device/${t}`, 'apns-topic': PASS_TYPE_ID, 'content-type': 'application/json' });
    let body = '';
    r.on('response', h => { r.on('data', c => (body += c)); r.on('end', () => resolve({ status: h[':status'], body })); });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    r.setTimeout(8000, () => { r.close(); resolve({ status: 0, body: 'timeout' }); });
    r.end('{}');
  })));
  apns.close();
  res.json({ sent: statuses.filter(s => s.status === 200).length, statuses });
}
