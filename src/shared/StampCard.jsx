import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { Checkmark24Filled, Star24Filled } from '@fluentui/react-icons';
import { META } from './supabase.js';

const GOLD = '#c9a227';

const useStyles = makeStyles({
  pass: {
    borderRadius: '18px',
    padding: '18px 20px 20px',
    color: '#f5f5f7',
    background: 'linear-gradient(150deg,#2a2a2d 0%,#111113 70%)',
    boxShadow: tokens.shadow16,
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: tokens.fontWeightSemibold, color: GOLD },
  pole: {
    width: '12px', height: '26px', borderRadius: '6px',
    background: 'repeating-linear-gradient(135deg,#f5f5f7 0 5px,#d72828 5px 10px)',
    boxShadow: `0 -3px 0 ${GOLD}, 0 3px 0 ${GOLD}`,
  },
  label: { fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: GOLD, fontWeight: tokens.fontWeightSemibold },
  count: { fontSize: '22px', fontWeight: tokens.fontWeightSemibold, textAlign: 'right', lineHeight: 1.1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 14px', margin: '20px auto 18px', maxWidth: '290px' },
  stamp: {
    aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center',
    border: '2px solid #48484a', color: '#636366', fontSize: '13px', transitionProperty: 'transform, background', transitionDuration: '.25s',
  },
  on: { border: '0', background: '#f5f5f7', color: '#111113' },
  gift: { borderColor: GOLD, color: GOLD },
  giftOn: { background: GOLD, color: '#111113' },
  pop: { transform: 'scale(1.15)' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' },
  value: { fontSize: '19px', marginTop: '2px' },
  right: { textAlign: 'right' },
});

// Réplica visual del pase de Apple Wallet
export function StampCard({ cliente, pop = -1 }) {
  const s = useStyles();
  const n = Math.min(cliente.sellos, META);
  return (
    <div className={s.pass}>
      <div className={s.top}>
        <div className={s.brand}><span className={s.pole} />Barbería El Filo</div>
        <div><div className={mergeClasses(s.label, s.right)}>Sellos</div><div className={s.count}>{n}/{META}</div></div>
      </div>
      <div className={s.grid}>
        {Array.from({ length: META }, (_, i) => {
          const on = i < n, gift = i === META - 1;
          return (
            <div key={i} className={mergeClasses(s.stamp, gift && s.gift, on && s.on, gift && on && s.giftOn, i === pop && s.pop)}>
              {gift ? <Star24Filled /> : on ? <Checkmark24Filled /> : i + 1}
            </div>
          );
        })}
      </div>
      <div className={s.bottom}>
        <div><div className={s.label}>Cliente</div><div className={s.value}>{cliente.nombre}</div></div>
        <div className={s.right}><div className={s.label}>Corte gratis</div><div className={s.value}>{n >= META ? '¡Ya es tuyo!' : `Faltan ${META - n}`}</div></div>
      </div>
    </div>
  );
}
