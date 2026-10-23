import { Text, Title2, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  wrap: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  sub: { color: tokens.colorNeutralForeground3, display: 'block', marginTop: '2px' },
});

export function PageHeader({ title, subtitle, children }) {
  const s = useStyles();
  return (
    <div className={s.wrap}>
      <div><Title2 as="h1" block>{title}</Title2>{subtitle && <Text className={s.sub}>{subtitle}</Text>}</div>
      {children}
    </div>
  );
}
