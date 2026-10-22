import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Button, Card, Input, MessageBar, MessageBarBody, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { CameraRegular, CameraOffRegular, SearchRegular, CheckmarkCircleRegular, GiftRegular, QrCodeRegular } from '@fluentui/react-icons';
import { sb, META } from '../shared/supabase.js';
import { StampCard } from '../shared/StampCard.jsx';
import { PageHeader } from '../shared/PageHeader.jsx';
import { registrar, pushWallet, useNotify } from './actions.js';

const useStyles = makeStyles({
  grid: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' },
  card: { padding: '20px', gap: '14px' },
  reader: {
    width: '100%', aspectRatio: '1', borderRadius: tokens.borderRadiusLarge, overflow: 'hidden',
    background: `radial-gradient(circle at 50% 40%, rgba(201,162,39,.10), transparent 60%), ${tokens.colorNeutralBackground3}`, display: 'grid', placeItems: 'center',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    '& video': { objectFit: 'cover' },
  },
  placeholder: { display: 'grid', placeItems: 'center', gap: '8px', color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '16px' },
  manual: { display: 'flex', gap: '8px', '& > span': { flex: 1 } },
  empty: { padding: '40px 16px', textAlign: 'center', color: tokens.colorNeutralForeground3, display: 'grid', placeItems: 'center', gap: '12px' },
  art: { width: '84px', height: '84px', objectFit: 'contain', opacity: 0.9, filter: 'drop-shadow(0 8px 24px rgba(201,162,39,.25))' },
});

export function Scan({ onChange }) {
  const s = useStyles();
  const notify = useNotify();
  const [cliente, setCliente] = useState(null);
  const [estado, setEstado] = useState(null); // { intent, text }
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);

  async function buscar(code) {
    const { data } = await sb.from('clientes').select('*').eq('codigo', code.trim().toUpperCase()).maybeSingle();
    setCliente(data);
    setEstado(data ? (data.sellos >= META ? { intent: 'warning', text: `¡Completó sus ${META} sellos! Este corte es gratis.` } : null)
                   : { intent: 'error', text: `No existe un cliente con el código ${code}` });
  }

  async function atender() {
    setBusy(true);
    try {
      const { cliente: c, mensaje } = await registrar(cliente);
      setCliente(c); setEstado({ intent: 'success', text: mensaje, pop: c.sellos - 1 });
      onChange();
      pushWallet(c.codigo).then(n => n && notify('Tarjeta de Wallet actualizada'));
    } catch (e) { notify(e.message, 'error'); buscar(cliente.codigo); }
    setBusy(false);
  }

  const lleno = cliente && cliente.sellos >= META;

  return (
    <>
      <PageHeader title="Escanear cliente" subtitle="Apunta la cámara al QR de la tarjeta del cliente." />
      <div className={s.grid}>
        <Card className={s.card}>
          <Camara onCode={buscar} />
          <form className={s.manual} onSubmit={e => { e.preventDefault(); if (codigo.trim()) buscar(codigo); }}>
            <Input value={codigo} onChange={(_, d) => setCodigo(d.value.toUpperCase())} placeholder="O escribe el código, ej. BRB-CAFF9F" contentBefore={<QrCodeRegular />} />
            <Button type="submit" icon={<SearchRegular />}>Buscar</Button>
          </form>
        </Card>

        {cliente ? (
          <Card className={s.card}>
            <StampCard cliente={cliente} pop={estado?.pop ?? -1} />
            {estado && <MessageBar intent={estado.intent}><MessageBarBody>{estado.text}</MessageBarBody></MessageBar>}
            <Button appearance="primary" size="large" disabled={busy} onClick={atender}
              icon={lleno ? <GiftRegular /> : <CheckmarkCircleRegular />}>
              {lleno ? 'Canjear corte gratis' : 'Marcar como atendido (+1 sello)'}
            </Button>
          </Card>
        ) : (
          <Card className={s.card}>
            {estado ? <MessageBar intent={estado.intent}><MessageBarBody>{estado.text}</MessageBarBody></MessageBar>
                    : <div className={s.empty}><img src="/brand/tijeras.png" alt="" className={s.art} />Aquí aparecerá la tarjeta del cliente.</div>}
          </Card>
        )}
      </div>
    </>
  );
}

function Camara({ onCode }) {
  const s = useStyles();
  const notify = useNotify();
  const [on, setOn] = useState(false);
  const scanner = useRef(null);
  const ultimo = useRef('');
  const cb = useRef(onCode);
  cb.current = onCode;

  useEffect(() => () => { if (scanner.current?.isScanning) scanner.current.stop().catch(() => {}); }, []);

  async function toggle() {
    if (on) { await scanner.current.stop().catch(() => {}); setOn(false); return; }
    scanner.current ??= new Html5Qrcode('reader');
    try {
      await scanner.current.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } }, text => {
        const code = text.trim().toUpperCase();
        if (code === ultimo.current) return; // evita lecturas repetidas del mismo QR
        ultimo.current = code;
        setTimeout(() => { if (ultimo.current === code) ultimo.current = ''; }, 4000);
        navigator.vibrate?.(60);
        cb.current(code);
      });
      setOn(true);
    } catch { notify('No se pudo abrir la cámara. Revisa los permisos.', 'error'); }
  }

  return (
    <>
      <div className={s.reader}>
        <div id="reader" style={{ width: '100%', display: on ? 'block' : 'none' }} />
        {!on && <div className={s.placeholder}><img src="/brand/maquina.png" alt="" className={s.art} /><Text weight="semibold">Listo para escanear</Text><Text size={200}>Activa la cámara y apunta al QR del cliente</Text></div>}
      </div>
      <Button appearance={on ? 'secondary' : 'primary'} icon={on ? <CameraOffRegular /> : <CameraRegular />} onClick={toggle}>
        {on ? 'Detener cámara' : 'Activar cámara'}
      </Button>
    </>
  );
}
