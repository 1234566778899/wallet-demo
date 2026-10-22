import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Field, Input, MessageBar, MessageBarBody, Spinner, Tab, TabList, Text, Title2, Toaster,
  Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, Avatar, makeStyles, tokens,
} from '@fluentui/react-components';
import { QrCodeRegular, PeopleRegular, HistoryRegular, SignOutRegular } from '@fluentui/react-icons';
import { sb } from '../shared/supabase.js';
import { TOASTER } from './actions.js';
import { Scan } from './Scan.jsx';
import { Clients } from './Clients.jsx';
import { Activity } from './Activity.jsx';

const useStyles = makeStyles({
  login: { maxWidth: '380px', margin: '0 auto', padding: '14vh 16px 0' },
  loginCard: { padding: '28px', gap: '16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400 },
  header: {
    position: 'sticky', top: 0, zIndex: 10, background: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, boxShadow: tokens.shadow2,
  },
  bar: { maxWidth: '1040px', margin: '0 auto', padding: '0 16px', height: '52px', display: 'flex', alignItems: 'center', gap: '12px' },
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
          <div className={s.brand}>💈<span className={s.brandText}>Barbería El Filo</span></div>
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
        <div>
          <div className={s.brand}>💈 Barbería El Filo</div>
          <Title2 as="h1" block style={{ marginTop: 8 }}>Iniciar sesión</Title2>
          <Text>Panel de fidelidad para el equipo</Text>
        </div>
        {err && <MessageBar intent="error"><MessageBarBody>{err}</MessageBarBody></MessageBar>}
        <Field label="Correo" required><Input type="email" value={email} onChange={(_, d) => setEmail(d.value)} /></Field>
        <Field label="Contraseña" required><Input type="password" value={pass} onChange={(_, d) => setPass(d.value)} /></Field>
        <Button appearance="primary" type="submit" disabled={busy} icon={busy ? <Spinner size="tiny" /> : undefined}>Entrar</Button>
      </Card>
    </div>
  );
}
