import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { display } from './Root.jsx';

const useStyles = makeStyles({
  wrap: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '22px', flexWrap: 'wrap' },
  title: { ...display, fontSize: '32px', margin: 0, lineHeight: 1.1, '@media (max-width: 480px)': { fontSize: '26px' } },
  sub: { color: tokens.colorNeutralForeground3, marginTop: '6px', display: 'block' },
});

export function PageHeader({ title, subtitle, children }) {
  const s = useStyles();
  return (
    <div className={s.wrap}>
      <div><h1 className={s.title}>{title}</h1>{subtitle && <Text className={s.sub}>{subtitle}</Text>}</div>
      {children}
    </div>
  );
}
