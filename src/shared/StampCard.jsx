import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { META } from './supabase.js';
import { GOLD, display } from './Root.jsx';

const useStyles = makeStyles({
  pass: {
    position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '18px 20px 20px', color: '#f5f5f7',
    background: `linear-gradient(160deg, rgba(17,17,19,.55), rgba(17,17,19,.92)), url(/brand/textura.jpg) center/cover, #111113`,
    border: '1px solid rgba(201,162,39,.28)',
    boxShadow: '0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '42px', height: '42px' },
  name: { ...display, fontSize: '19px', color: GOLD, lineHeight: 1 },
  tag: { fontSize: '10px', letterSpacing: '.22em', textTransform: 'uppercase', color: '#a1a1a6', marginTop: '3px' },
  label: { fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: GOLD, fontWeight: tokens.fontWeightSemibold },
  count: { fontSize: '24px', fontWeight: tokens.fontWeightSemibold, textAlign: 'right', lineHeight: 1.1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 14px', margin: '22px auto 20px', maxWidth: '300px' },
  stamp: {
    aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center',
    border: '1.5px solid #46464a', background: 'rgba(17,17,19,.75)', color: '#6e6e73', fontSize: '13px',
    transitionProperty: 'transform, box-shadow', transitionDuration: '.3s',
  },
  on: { borderColor: GOLD, background: '#1c1c1e', boxShadow: '0 0 14px rgba(201,162,39,.25)' },
  gift: { borderColor: GOLD },
  icon: { width: '74%', height: '74%', objectFit: 'contain' },
  dim: { opacity: 0.45, filter: 'grayscale(.85)' },
  pop: { transform: 'scale(1.18)', boxShadow: '0 0 24px rgba(201,162,39,.6)' },
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
        <div className={s.brand}>
          <img src="/brand/logo.png" alt="" className={s.logo} />
          <div><div className={s.name}>El Filo</div><div className={s.tag}>Barbería</div></div>
        </div>
        <div><div className={mergeClasses(s.label, s.right)}>Sellos</div><div className={s.count}>{n}/{META}</div></div>
      </div>
      <div className={s.grid}>
        {Array.from({ length: META }, (_, i) => {
          const on = i < n, gift = i === META - 1;
          return (
            <div key={i} className={mergeClasses(s.stamp, gift && s.gift, on && s.on, i === pop && s.pop)}>
              {gift ? <img src="/brand/regalo.png" alt="Corte gratis" className={mergeClasses(s.icon, !on && s.dim)} />
                : on ? <img src="/brand/tijeras.png" alt="Sello" className={s.icon} /> : i + 1}
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
