import { FluentProvider, createDarkTheme, tokens } from '@fluentui/react-components';

// Rampa de marca dorada El Filo (#C9A227 en el 90)
const gold = {
  10: '#140F02', 20: '#2A1F05', 30: '#3F2E08', 40: '#543E0B', 50: '#6A4E0F', 60: '#7F5E13', 70: '#956F18', 80: '#B48B22',
  90: '#C9A227', 100: '#D4B045', 110: '#DCBD60', 120: '#E3C97A', 130: '#EAD594', 140: '#F0E1AE', 150: '#F6ECC9', 160: '#FBF6E4',
};

export const theme = {
  ...createDarkTheme(gold),
  colorBrandBackground: gold[90],
  colorBrandBackgroundHover: gold[100],
  colorBrandBackgroundPressed: gold[80],
  colorBrandBackgroundSelected: gold[90],
  colorNeutralForegroundOnBrand: '#111113',
  colorBrandForeground1: gold[100],
  colorBrandForeground2: gold[110],
  colorBrandForegroundLink: gold[100],
  colorBrandForegroundLinkHover: gold[120],
  colorCompoundBrandStroke: gold[90],
  colorCompoundBrandBackground: gold[90],
  colorNeutralBackground1: '#1b1b1d',
  colorNeutralBackground1Hover: '#242427',
  colorNeutralBackground1Pressed: '#202022',
  colorNeutralBackground2: '#141415',
  colorNeutralBackground3: '#0f0f10',
  colorNeutralStroke2: '#2a2a2d',
  fontFamilyBase: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const GOLD = gold[90];
export const display = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' };

// La marca es oscura: el panel y la tarjeta usan siempre el tema oscuro dorado
export function Root({ children }) {
  return (
    <FluentProvider theme={theme} style={{ minHeight: '100vh', background: tokens.colorNeutralBackground2 }}>
      {children}
    </FluentProvider>
  );
}
