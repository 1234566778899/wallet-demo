import { useEffect, useState } from 'react';
import {
  Avatar, Badge, Card, Skeleton, SkeletonItem, Table, TableBody, TableCell, TableCellLayout, TableHeader,
  TableHeaderCell, TableRow, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { sb } from '../shared/supabase.js';
import { PageHeader } from '../shared/PageHeader.jsx';
import { CutRegular, GiftRegular, PeopleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
  stat: { padding: '16px', gap: '4px', flexDirection: 'row', alignItems: 'center' },
  num: { fontSize: '28px', fontWeight: tokens.fontWeightBold, lineHeight: 1.1, '@media (max-width: 480px)': { fontSize: '22px' } },
  table: { background: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusLarge, overflow: 'hidden', boxShadow: tokens.shadow4 },
  hideSm: { '@media (max-width: 640px)': { display: 'none' } },
  empty: { padding: '40px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

const fmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function Activity() {
  const s = useStyles();
  const [visitas, setVisitas] = useState(null);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    Promise.all([
      sb.from('visitas').select('id,tipo,barbero,created_at,clientes(nombre,codigo)').order('created_at', { ascending: false }).limit(50),
      sb.from('clientes').select('id', { count: 'exact', head: true }),
    ]).then(([v, c]) => { setVisitas(v.data || []); setTotal(c.count ?? 0); });
  }, []);

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const deHoy = (visitas || []).filter(v => new Date(v.created_at) >= hoy);
  const stats = [
    ['Atendidos hoy', deHoy.length, <CutRegular />, 'brand'],
    ['Cortes gratis hoy', deHoy.filter(v => v.tipo === 'canje').length, <GiftRegular />, 'marigold'],
    ['Clientes', total, <PeopleRegular />, 'teal'],
  ];

  return (
    <>
      <PageHeader title="Actividad" subtitle="Visitas registradas recientemente." />
      <div className={s.stats}>
        {stats.map(([label, n, icon, color]) => (
          <Card key={label} className={s.stat}>
            <Avatar icon={icon} color={color} size={40} className={s.hideSm} />
            <div style={{ marginLeft: 8 }}>
              {visitas === null ? <Skeleton><SkeletonItem size={28} /></Skeleton> : <div className={s.num}>{n}</div>}
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{label}</Text>
            </div>
          </Card>
        ))}
      </div>
      <div className={s.table}>
        <Table aria-label="Visitas">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell className={s.hideSm}>Barbero</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(visitas || []).map(v => (
              <TableRow key={v.id}>
                <TableCell>
                  <TableCellLayout media={<Avatar icon={v.tipo === 'canje' ? <GiftRegular /> : <CutRegular />} color={v.tipo === 'canje' ? 'marigold' : 'brand'} />}
                    description={fmt.format(new Date(v.created_at))}>{v.clientes?.nombre || 'Cliente'}</TableCellLayout>
                </TableCell>
                <TableCell className={s.hideSm}>{v.barbero}</TableCell>
                <TableCell>
                  {v.tipo === 'canje' ? <Badge appearance="filled" color="success" icon={<GiftRegular />}>Corte gratis</Badge> : <Badge appearance="tint" color="brand">+1 sello</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {visitas?.length === 0 && <div className={s.empty}>Sin visitas todavía</div>}
      </div>
    </>
  );
}
