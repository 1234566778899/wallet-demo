import { useEffect, useState } from 'react';
import {
  Avatar, Badge, Card, Skeleton, SkeletonItem, Table, TableBody, TableCell, TableCellLayout, TableHeader,
  TableHeaderCell, TableRow, Text, Title2, makeStyles, tokens,
} from '@fluentui/react-components';
import { CutRegular, GiftRegular } from '@fluentui/react-icons';
import { sb } from '../shared/supabase.js';

const useStyles = makeStyles({
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
  stat: { padding: '16px' },
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
    ['Atendidos hoy', deHoy.length],
    ['Cortes gratis hoy', deHoy.filter(v => v.tipo === 'canje').length],
    ['Clientes', total],
  ];

  return (
    <>
      <Title2 as="h1" block>Actividad</Title2>
      <Text block style={{ color: tokens.colorNeutralForeground3, marginBottom: 20 }}>Visitas registradas recientemente.</Text>
      <div className={s.stats}>
        {stats.map(([label, n]) => (
          <Card key={label} className={s.stat}>
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
                  <TableCellLayout media={<Avatar icon={v.tipo === 'canje' ? <GiftRegular /> : <CutRegular />} color={v.tipo === 'canje' ? 'marigold' : 'neutral'} />}
                    description={fmt.format(new Date(v.created_at))}>{v.clientes?.nombre || 'Cliente'}</TableCellLayout>
                </TableCell>
                <TableCell className={s.hideSm}>{v.barbero}</TableCell>
                <TableCell>
                  {v.tipo === 'canje' ? <Badge appearance="filled" color="warning">Corte gratis</Badge> : <Badge appearance="tint" color="brand">+1 sello</Badge>}
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
