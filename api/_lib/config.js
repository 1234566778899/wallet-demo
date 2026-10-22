import fs from 'node:fs';
import path from 'node:path';

export const SUPABASE_URL = 'https://edwpsahpqdlbiqrelyfm.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_filexaTBjLAbgRGNwscrEg_CLvIyh8_';
export const PASS_TYPE_ID = 'pass.com.carlosordaz.elfilo';
export const TEAM_ID = 'JZ9Z9GWH7P';
export const META = 10;

const root = process.cwd();
export const readAsset = name => fs.readFileSync(path.join(root, 'assets/pass', name));

// Certificado público del Pass Type ID + intermedio WWDR G4 (en el repo); la llave privada solo en env
export const certs = () => {
  if (!process.env.PASS_KEY_B64) throw new Error('Falta la variable PASS_KEY_B64');
  return {
    wwdr: fs.readFileSync(path.join(root, 'certs/wwdr.pem')),
    signerCert: fs.readFileSync(path.join(root, 'certs/pass.pem')),
    signerKey: Buffer.from(process.env.PASS_KEY_B64, 'base64'),
  };
};

// Llama funciones de Postgres con la llave pública; el acceso lo controlan las funciones security definer
export async function rpc(fn, args, jwt) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: JSON.stringify(args),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(data?.message || 'Error de base de datos'), { status: r.status });
  return data;
}

export const baseUrl = req => `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
