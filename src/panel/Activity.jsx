import { useEffect, useState } from 'react';
import {
  Avatar, Badge, Card, Skeleton, SkeletonItem, Table, TableBody, TableCell, TableCellLayout, TableHeader,
  TableHeaderCell, TableRow, Text, makeStyles, tokens,
} from '@fluentui/react-components';
import { sb } from '../shared/supabase.js';
import { PageHeader } from '../shared/PageHeader.jsx';
import { GOLD, GOLD_TEXT } from '../shared/Root.jsx';

const useStyles = makeStyles({
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
  stat: { padding: '18px', gap: '4px', position: 'relative', overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke2}` },
  statArt: { position: 'absolute', right: '-6px', bottom: '-8px', width: '64px', opacity: 0.28 },
  ico: { width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#111113', border: `1px solid ${GOLD}55`, '& img': { width: '70%', height: '70%', objectFit: 'contain' } },
  num: { color: GOLD_TEXT, fontSize: '30px', fontWeight: tokens.fontWeightBold, lineHeight: 1.1, '@media (max-width: 480px)': { fontSize: '22px' } },
  table: { background: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusXLarge, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke2}` },
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
    ['Atendidos hoy', deHoy.length, 'tijeras'],
    ['Cortes gratis hoy', deHoy.filter(v => v.tipo === 'canje').length, 'regalo'],
    ['Clientes', total, 'estrella'],
  ];

  return (
    <>
      <PageHeader title="Actividad" subtitle="Visitas registradas recientemente." />
      <div className={s.stats}>
        {stats.map(([label, n, art]) => (
          <Card key={label} className={s.stat}>
            <img src={`/brand/${art}.png`} alt="" className={s.statArt} />
            {visitas === null ? <Skeleton><SkeletonItem size={28} /></Skeleton> : <div className={s.num}>{n}</div>}
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{label}</Text>
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
                  <TableCellLayout media={<span className={s.ico}><img src={v.tipo === 'canje' ? '/brand/regalo.png' : '/brand/tijeras.png'} alt="" /></span>}
                    description={fmt.format(new Date(v.created_at))}>{v.clientes?.nombre || 'Cliente'}</TableCellLayout>
                </TableCell>
                <TableCell className={s.hideSm}>{v.barbero}</TableCell>
                <TableCell>
                  {v.tipo === 'canje' ? <Badge appearance="filled" color="brand">Corte gratis</Badge> : <Badge appearance="tint" color="brand">+1 sello</Badge>}
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
