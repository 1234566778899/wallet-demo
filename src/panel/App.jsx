import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Field, Input, MessageBar, MessageBarBody, Spinner, Tab, TabList, Text, Toaster,
  Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Avatar, makeStyles, mergeClasses, tokens,
} from '@fluentui/react-components';
import { QrCodeRegular, PeopleRegular, HistoryRegular, SignOutRegular, MailRegular, LockClosedRegular } from '@fluentui/react-icons';
import { sb } from '../shared/supabase.js';
import { display } from '../shared/Root.jsx';
import { TOASTER } from './actions.js';
import { Scan } from './Scan.jsx';
import { Clients } from './Clients.jsx';
import { Activity } from './Activity.jsx';

const useStyles = makeStyles({
  login: {
    minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr',
    '@media (max-width: 860px)': { gridTemplateColumns: '1fr', gridTemplateRows: '260px 1fr' },
  },
  hero: {
    position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px',
    background: 'linear-gradient(180deg, rgba(10,10,11,.15) 0%, rgba(10,10,11,.85) 100%), url(/brand/interior.jpg) center/cover',
    '@media (max-width: 860px)': { padding: '24px' },
  },
  heroLogo: { width: '96px', height: '96px', marginBottom: '18px', '@media (max-width: 860px)': { width: '64px', height: '64px', marginBottom: '10px' } },
  heroTitle: { ...display, fontSize: '44px', lineHeight: 1.05, color: '#f5f5f7', margin: 0, '@media (max-width: 860px)': { fontSize: '28px' } },
  heroText: { color: '#c7c7cc', marginTop: '10px', maxWidth: '420px', fontSize: tokens.fontSizeBase400 },
  formSide: { display: 'grid', placeItems: 'center', padding: '32px 16px', background: tokens.colorNeutralBackground1 },
  loginCard: { width: '100%', maxWidth: '380px', padding: '32px', gap: '18px' },
  loginTitle: { ...display, fontSize: '28px', margin: '0 0 6px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandLogo: { width: '34px', height: '34px' },
  brandName: { ...display, fontSize: '20px', color: '#111113' },
  header: {
    position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,.86)', backdropFilter: 'saturate(160%) blur(18px)',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  bar: { maxWidth: '1040px', margin: '0 auto', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', gap: '12px' },
  brandText: { '@media (max-width: 640px)': { display: 'none' } },
  tabs: { marginLeft: 'auto' },
  tabLabel: { '@media (max-width: 480px)': { display: 'none' } },
  main: { maxWidth: '1040px', margin: '0 auto', padding: '24px 16px 80px' },
});

export function App() {
  const s = useStyles();
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState('scan');
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, ses) => setSession(ses));
    return () => subscription.unsubscribe();
  }, []);

  const recargar = useCallback(async () => {
    const { data } = await sb.from('clientes').select('*').order('created_at', { ascending: false });
    setClientes(data || []);
  }, []);
  useEffect(() => { if (session) recargar(); }, [session, recargar]);

  if (session === undefined) return <Spinner style={{ paddingTop: '30vh' }} />;
  if (!session) return <Login />;

  return (
    <>
      <Toaster toasterId={TOASTER} position="bottom" />
      <header className={s.header}>
        <div className={s.bar}>
          <div className={s.brand}><img src="/brand/logo.png" alt="El Filo" className={s.brandLogo} /><span className={mergeClasses(s.brandName, s.brandText)}>El Filo</span></div>
          <TabList className={s.tabs} selectedValue={tab} onTabSelect={(_, d) => setTab(d.value)}>
            <Tab value="scan" icon={<QrCodeRegular />}><span className={s.tabLabel}>Escanear</span></Tab>
            <Tab value="clients" icon={<PeopleRegular />}><span className={s.tabLabel}>Clientes</span></Tab>
            <Tab value="activity" icon={<HistoryRegular />}><span className={s.tabLabel}>Actividad</span></Tab>
          </TabList>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="transparent" shape="circular" aria-label="Cuenta"
                icon={<Avatar size={28} name={session.user.email} color="colorful" />} />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem disabled>{session.user.email}</MenuItem>
                <MenuItem icon={<SignOutRegular />} onClick={() => sb.auth.signOut()}>Cerrar sesión</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>
      <main className={s.main}>
        {tab === 'scan' && <Scan clientes={clientes} onChange={recargar} />}
        {tab === 'clients' && <Clients clientes={clientes} onChange={recargar} />}
        {tab === 'activity' && <Activity />}
      </main>
    </>
  );
}

function Login() {
  const s = useStyles();
  const [email, setEmail] = useState('barbero@demo.com');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function entrar(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (error) setErr('Correo o contraseña incorrectos');
  }

  return (
    <div className={s.login}>
      <section className={s.hero}>
        <img src="/brand/logo.png" alt="El Filo Barbería" className={s.heroLogo} />
        <h1 className={s.heroTitle}>Cada corte cuenta.</h1>
        <Text className={s.heroText}>Escanea la tarjeta del cliente, suma sus sellos y regálale su corte número 10.</Text>
      </section>
      <div className={s.formSide}>
        <Card as="form" className={s.loginCard} onSubmit={entrar} appearance="subtle">
          <div>
            <h2 className={s.loginTitle}>Iniciar sesión</h2>
            <Text style={{ color: tokens.colorNeutralForeground3 }}>Panel del equipo de El Filo</Text>
          </div>
          {err && <MessageBar intent="error"><MessageBarBody>{err}</MessageBarBody></MessageBar>}
          <Field label="Correo" required><Input size="large" type="email" value={email} onChange={(_, d) => setEmail(d.value)} contentBefore={<MailRegular />} /></Field>
          <Field label="Contraseña" required><Input size="large" type="password" value={pass} onChange={(_, d) => setPass(d.value)} contentBefore={<LockClosedRegular />} /></Field>
          <Button appearance="primary" size="large" type="submit" disabled={busy} icon={busy ? <Spinner size="tiny" /> : undefined}>Entrar</Button>
        </Card>
      </div>
    </div>
  );
}
