import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Avatar, Badge, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger,
  Field, Input, MessageBar, MessageBarBody, ProgressBar, SearchBox, Table, TableBody, TableCell, TableCellLayout,
  TableHeader, TableHeaderCell, TableRow, Text, Title2, makeStyles, tokens,
} from '@fluentui/react-components';
import {
  AddRegular, QrCodeRegular, LinkRegular, ChatRegular, CheckmarkCircleRegular, GiftRegular, DismissRegular,
} from '@fluentui/react-icons';
import { sb, META } from '../shared/supabase.js';
import { StampCard } from '../shared/StampCard.jsx';
import { registrar, pushWallet, useNotify, cardUrl, copiar } from './actions.js';

const useStyles = makeStyles({
  toolbar: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', '& > :first-child': { flex: '1 1 220px', maxWidth: 'none' } },
  table: { background: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusLarge, overflow: 'hidden', boxShadow: tokens.shadow4 },
  row: { cursor: 'pointer' },
  hideSm: { '@media (max-width: 640px)': { display: 'none' } },
  progress: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' },
  qr: { background: '#fff', padding: '14px', borderRadius: tokens.borderRadiusLarge, width: 'max-content', margin: '4px auto 0' },
  col: { display: 'flex', flexDirection: 'column', gap: '14px' },
  two: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  muted: { color: tokens.colorNeutralForeground3, textAlign: 'center' },
  empty: { padding: '40px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export function Clients({ clientes, onChange }) {
  const s = useStyles();
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(null); // id del cliente en el diálogo
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return clientes.filter(c => !t || [c.nombre, c.telefono, c.codigo].some(v => (v || '').toLowerCase().includes(t)));
  }, [clientes, q]);
  const actual = clientes.find(c => c.id === abierto);

  return (
    <>
      <Title2 as="h1" block>Clientes</Title2>
      <Text block style={{ color: tokens.colorNeutralForeground3, marginBottom: 20 }}>{META} sellos = 1 corte gratis.</Text>
      <div className={s.toolbar}>
        <SearchBox placeholder="Buscar por nombre, teléfono o código" value={q} onChange={(_, d) => setQ(d.value)} />
        <QrRegistro />
        <NuevoCliente onCreado={async c => { await onChange(); setAbierto(c.id); }} />
      </div>

      <div className={s.table}>
        <Table aria-label="Clientes">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell className={s.hideSm}>Teléfono</TableHeaderCell>
              <TableHeaderCell>Sellos</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map(c => (
              <TableRow key={c.id} className={s.row} onClick={() => setAbierto(c.id)}>
                <TableCell>
                  <TableCellLayout media={<Avatar name={c.nombre} color="colorful" />} description={c.codigo}>{c.nombre}</TableCellLayout>
                </TableCell>
                <TableCell className={s.hideSm}>{c.telefono || '—'}</TableCell>
                <TableCell>
                  {c.sellos >= META ? <Badge appearance="filled" color="warning" icon={<GiftRegular />}>Corte gratis</Badge> : (
                    <div className={s.progress}>
                      <ProgressBar value={c.sellos / META} thickness="large" style={{ flex: 1 }} />
                      <Text size={200}>{c.sellos}/{META}</Text>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!lista.length && <div className={s.empty}>{q ? 'Sin resultados' : 'Aún no hay clientes'}</div>}
      </div>

      {actual && <ClienteDialog cliente={actual} onClose={() => setAbierto(null)} onChange={onChange} />}
    </>
  );
}

function ClienteDialog({ cliente, onClose, onChange }) {
  const s = useStyles();
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const lleno = cliente.sellos >= META;
  const url = cardUrl(cliente);
  const wa = `https://wa.me/${(cliente.telefono || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${cliente.nombre}, aquí está tu tarjeta de Barbería El Filo para agregarla a tu Wallet: ${url}`)}`;

  async function atender() {
    setBusy(true);
    try {
      const { cliente: c, mensaje } = await registrar(cliente);
      setMsg(mensaje); await onChange();
      pushWallet(c.codigo).then(n => n && notify('Tarjeta de Wallet actualizada'));
    } catch (e) { notify(e.message, 'error'); }
    setBusy(false);
  }

  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 440 }}>
        <DialogBody>
          <DialogTitle action={<DialogTrigger action="close"><Button appearance="subtle" aria-label="Cerrar" icon={<DismissRegular />} /></DialogTrigger>}>
            {cliente.nombre}
          </DialogTitle>
          <DialogContent className={s.col}>
            <Text className={s.muted}>{cliente.telefono || 'Sin teléfono'} · {cliente.total_visitas} visitas · {cliente.cortes_gratis} gratis</Text>
            <StampCard cliente={cliente} />
            {msg && <MessageBar intent="success"><MessageBarBody>{msg}</MessageBarBody></MessageBar>}
            <div className={s.qr}><QRCodeSVG value={cliente.codigo} size={150} /></div>
            <Text className={s.muted} size={200}>QR de la tarjeta · {cliente.codigo}</Text>
            <div className={s.two}>
              <Button icon={<LinkRegular />} onClick={() => copiar(url, notify)}>Copiar link</Button>
              <Button as="a" href={wa} target="_blank" rel="noopener" icon={<ChatRegular />}>WhatsApp</Button>
            </div>
          </DialogContent>
          <DialogActions fluid>
            <Button appearance="primary" style={{ width: '100%' }} disabled={busy} onClick={atender}
              icon={lleno ? <GiftRegular /> : <CheckmarkCircleRegular />}>
              {lleno ? 'Canjear corte gratis' : 'Marcar como atendido (+1 sello)'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function NuevoCliente({ onCreado }) {
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [err, setErr] = useState('');

  async function crear(e) {
    e.preventDefault(); setErr('');
    const { data, error } = await sb.from('clientes').insert({ nombre: nombre.trim(), telefono: tel.trim() || null }).select().single();
    if (error) return setErr(error.message);
    setOpen(false); setNombre(''); setTel('');
    notify('Tarjeta creada');
    onCreado(data);
  }

  return (
    <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement><Button appearance="primary" icon={<AddRegular />}>Nuevo</Button></DialogTrigger>
      <DialogSurface style={{ maxWidth: 420 }}>
        <form onSubmit={crear}>
          <DialogBody>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {err && <MessageBar intent="error"><MessageBarBody>{err}</MessageBarBody></MessageBar>}
              <Field label="Nombre" required><Input value={nombre} onChange={(_, d) => setNombre(d.value)} autoFocus /></Field>
              <Field label="Teléfono"><Input type="tel" value={tel} onChange={(_, d) => setTel(d.value)} /></Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button>Cancelar</Button></DialogTrigger>
              <Button appearance="primary" type="submit">Crear tarjeta</Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

function QrRegistro() {
  const s = useStyles();
  const notify = useNotify();
  const url = `${location.origin}/tarjeta`;
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement><Button icon={<QrCodeRegular />}>QR registro</Button></DialogTrigger>
      <DialogSurface style={{ maxWidth: 400 }}>
        <DialogBody>
          <DialogTitle>QR de registro</DialogTitle>
          <DialogContent className={s.col}>
            <Text>Ponlo en el mostrador: el cliente lo escanea, crea su tarjeta y la agrega a Apple Wallet.</Text>
            <div className={s.qr}><QRCodeSVG value={url} size={200} /></div>
          </DialogContent>
          <DialogActions>
            <Button icon={<LinkRegular />} onClick={() => copiar(url, notify)}>Copiar link</Button>
            <DialogTrigger disableButtonEnhancement><Button appearance="primary">Listo</Button></DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
