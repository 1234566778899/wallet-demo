import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Avatar, Button, Card, Field, Input, Link, MessageBar, MessageBarBody, Spinner, Text, Title1, makeStyles, tokens,
} from '@fluentui/react-components';
import { WalletRegular, PersonAddRegular, CutRegular, GiftRegular } from '@fluentui/react-icons';
import { sb } from '../shared/supabase.js';
import { StampCard } from '../shared/StampCard.jsx';

const KEY = 'elfilo_token';
const store = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch {} },
};
const ua = navigator.userAgent;
const puedeWallet = /iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ||
  (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|CriOS|Firefox|Edg/.test(ua));

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    background: tokens.colorNeutralBackground2,
  },
  main: { maxWidth: '420px', margin: '0 auto', padding: '28px 16px 48px', display: 'flex', flexDirection: 'column', gap: '18px' },
  brand: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  logo: { width: '72px', height: '72px' },
  head: { textAlign: 'center' },
  muted: { color: tokens.colorNeutralForeground3, textAlign: 'center' },
  form: { padding: '24px', gap: '16px' },
  perks: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  perk: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center', fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 },
  qrCard: { padding: '18px', alignItems: 'center', gap: '8px' },
  qr: { background: '#fff', padding: '12px', borderRadius: tokens.borderRadiusLarge, border: `1px solid ${tokens.colorNeutralStroke2}` },
  code: { fontFamily: tokens.fontFamilyMonospace, color: tokens.colorNeutralForeground3 },
  wallet: {
    background: '#000', color: '#fff', border: '1px solid #3a3a3c', minHeight: '48px', fontSize: tokens.fontSizeBase400,
    ':hover': { background: '#1c1c1e', color: '#fff' }, ':hover:active': { background: '#2c2c2e', color: '#fff' },
  },
});

export function Tarjeta() {
  const s = useStyles();
  const [token, setToken] = useState(() => new URLSearchParams(location.search).get('t') || store.get());
  const [cliente, setCliente] = useState(undefined);

  useEffect(() => {
    if (!token) { setCliente(null); return; }
    sb.rpc('tarjeta_por_token', { p_token: token }).then(({ data }) => {
      const c = data?.[0];
      if (!c) { store.set(null); history.replaceState(null, '', '/tarjeta'); setToken(null); return setCliente(null); }
      store.set(token);
      history.replaceState(null, '', `/tarjeta?t=${token}`);
      setCliente(c);
    });
  }, [token]);

  function olvidar() { store.set(null); history.replaceState(null, '', '/tarjeta'); setToken(null); }

  return (
    <div className={s.page}><main className={s.main}>
      <div className={s.brand}><img src="/brand/logo.png" alt="El Filo Barbería" className={s.logo} /></div>
      {cliente === undefined ? <Spinner style={{ marginTop: 80 }} /> : cliente ? (
        <>
          <StampCard cliente={cliente} />
          {puedeWallet ? (
            <Button as="a" href={`/api/pass?t=${token}`} size="large" className={s.wallet} icon={<WalletRegular />}>
              Agregar a Apple Wallet
            </Button>
          ) : (
            <MessageBar intent="info"><MessageBarBody>Abre esta página en Safari desde tu iPhone para agregarla a Wallet.</MessageBarBody></MessageBar>
          )}
          <Card className={s.qrCard}>
            <div className={s.qr}><QRCodeSVG value={cliente.codigo} size={170} /></div>
            <Text className={s.code}>{cliente.codigo}</Text>
            <Text className={s.muted} size={200}>Muestra este QR al barbero cada vez que te cortes el pelo.</Text>
          </Card>
          <Link as="button" onClick={olvidar} style={{ alignSelf: 'center' }}>¿No eres tú? Crear otra tarjeta</Link>
        </>
      ) : <Registro onCreada={setToken} />}
    </main></div>
  );
}

function Registro({ onCreada }) {
  const s = useStyles();
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function crear(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { data, error } = await sb.rpc('registrar_cliente', { p_nombre: nombre, p_telefono: tel });
    setBusy(false);
    if (error) return setErr(error.message);
    onCreada(data);
  }

  return (
    <>
      <div className={s.head}>
        <Title1 as="h1" block align="center">Tu tarjeta de cortes</Title1>
        <Text className={s.muted} block>Junta 10 sellos y tu siguiente corte es gratis.</Text>
      </div>
      <div className={s.perks}>
        <div className={s.perk}><Avatar icon={<CutRegular />} color="brand" size={40} />Un sello por cada corte</div>
        <div className={s.perk}><Avatar icon={<GiftRegular />} color="marigold" size={40} />El 10.º es gratis</div>
        <div className={s.perk}><Avatar icon={<WalletRegular />} color="teal" size={40} />Siempre en tu Wallet</div>
      </div>
      <Card as="form" className={s.form} onSubmit={crear}>
        {err && <MessageBar intent="error"><MessageBarBody>{err}</MessageBarBody></MessageBar>}
        <Field label="Nombre" required><Input size="large" autoComplete="name" value={nombre} onChange={(_, d) => setNombre(d.value)} /></Field>
        <Field label="Teléfono" hint="Opcional"><Input size="large" type="tel" autoComplete="tel" value={tel} onChange={(_, d) => setTel(d.value)} /></Field>
        <Button appearance="primary" size="large" type="submit" disabled={busy}
          icon={busy ? <Spinner size="tiny" /> : <PersonAddRegular />}>Crear mi tarjeta</Button>
      </Card>
    </>
  );
}
