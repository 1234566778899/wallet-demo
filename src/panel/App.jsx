import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Field, Input, MessageBar, MessageBarBody, Spinner, Subtitle1, Tab, TabList, Text, Title2, Toaster,
  Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Avatar, makeStyles, tokens,
} from '@fluentui/react-components';
import { QrCodeRegular, PeopleRegular, HistoryRegular, SignOutRegular, MailRegular, LockClosedRegular } from '@fluentui/react-icons';
import { sb } from '../shared/supabase.js';
import { TOASTER } from './actions.js';
import { Scan } from './Scan.jsx';
import { Clients } from './Clients.jsx';
import { Activity } from './Activity.jsx';

const useStyles = makeStyles({
  login: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '16px' },
  loginCard: { width: '100%', maxWidth: '400px', padding: '32px', gap: '16px' },
  loginLogo: { width: '64px', height: '64px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandLogo: { width: '32px', height: '32px' },
  header: {
    position: 'sticky', top: 0, zIndex: 10, background: tokens.colorNeutralBackground1, boxShadow: tokens.shadow4,
  },
  bar: { maxWidth: '1040px', margin: '0 auto', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' },
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
          <div className={s.brand}><img src="/brand/logo.png" alt="El Filo" className={s.brandLogo} /><Subtitle1 className={s.brandText}>El Filo</Subtitle1></div>
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
      <Card as="form" className={s.loginCard} onSubmit={entrar}>
        <img src="/brand/logo.png" alt="El Filo Barbería" className={s.loginLogo} />
        <div>
          <Title2 as="h1" block>Iniciar sesión</Title2>
          <Text style={{ color: tokens.colorNeutralForeground3 }}>Panel de fidelidad de Barbería El Filo</Text>
        </div>
        {err && <MessageBar intent="error"><MessageBarBody>{err}</MessageBarBody></MessageBar>}
        <Field label="Correo" required><Input type="email" value={email} onChange={(_, d) => setEmail(d.value)} contentBefore={<MailRegular />} /></Field>
        <Field label="Contraseña" required><Input type="password" value={pass} onChange={(_, d) => setPass(d.value)} contentBefore={<LockClosedRegular />} /></Field>
        <Button appearance="primary" type="submit" disabled={busy} icon={busy ? <Spinner size="tiny" /> : undefined}>Entrar</Button>
      </Card>
    </div>
  );
}
