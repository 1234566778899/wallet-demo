import { useCallback } from 'react';
import { Toast, ToastTitle, useToastController } from '@fluentui/react-components';
import { createElement as h } from 'react';
import { sb, META } from '../shared/supabase.js';

export const TOASTER = 'panel-toaster';

export function useNotify() {
  const { dispatchToast } = useToastController(TOASTER);
  return useCallback((text, intent = 'success') =>
    dispatchToast(h(Toast, null, h(ToastTitle, null, text)), { intent, timeout: 2600 }), [dispatchToast]);
}

// Avisa a Apple Wallet para que el pase del cliente se actualice
export async function pushWallet(codigo) {
  const { data: { session } } = await sb.auth.getSession();
  const r = await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify({ codigo }),
  }).then(r => r.json()).catch(() => null);
  return r?.sent || 0;
}

// Sella o canjea; devuelve { cliente, mensaje } o lanza el error de la base
export async function registrar(cliente) {
  const canje = cliente.sellos >= META;
  const { data, error } = await sb.rpc(canje ? 'canjear_corte' : 'registrar_sello', { p_codigo: cliente.codigo });
  if (error) throw error;
  const c = Array.isArray(data) ? data[0] : data;
  const mensaje = canje
    ? 'Corte gratis canjeado. La tarjeta empieza de nuevo.'
    : c.sellos >= META ? `Sello ${c.sellos}/${META}. ¡Su próximo corte es gratis!` : `Atendido. Lleva ${c.sellos}/${META} sellos.`;
  return { cliente: c, mensaje };
}

export const cardUrl = c => `${location.origin}/tarjeta?t=${c.token}`;

export async function copiar(text, notify) {
  try { await navigator.clipboard.writeText(text); notify('Link copiado'); }
  catch { window.prompt('Copia el link:', text); }
}
