import { FluentProvider, createLightTheme, tokens } from '@fluentui/react-components';

// Rampa de marca dorada El Filo (#C9A227 en el 90)
const gold = {
  10: '#140F02', 20: '#2A1F05', 30: '#3F2E08', 40: '#543E0B', 50: '#6A4E0F', 60: '#7F5E13', 70: '#956F18', 80: '#B48B22',
  90: '#C9A227', 100: '#D4B045', 110: '#DCBD60', 120: '#E3C97A', 130: '#EAD594', 140: '#F0E1AE', 150: '#F6ECC9', 160: '#FBF6E4',
};

export const theme = {
  ...createLightTheme(gold),
  colorBrandBackground: gold[90],
  colorBrandBackgroundHover: gold[80],
  colorBrandBackgroundPressed: gold[70],
  colorBrandBackgroundSelected: gold[90],
  colorNeutralForegroundOnBrand: '#111113',
  colorBrandForeground1: gold[60],
  colorBrandForeground2: gold[50],
  colorBrandForegroundLink: gold[60],
  colorBrandForegroundLinkHover: gold[50],
  colorCompoundBrandStroke: gold[80],
  colorCompoundBrandForeground1: gold[60],
  colorCompoundBrandBackground: gold[90],
  colorNeutralBackground2: '#f6f5f2',
  colorNeutralBackground3: '#efede8',
  fontFamilyBase: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const GOLD = gold[90];
export const GOLD_TEXT = gold[60]; // dorado legible sobre fondo claro
export const display = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' };

// Tema claro con el dorado de la marca; la tarjeta de sellos se mantiene oscura como el pase
export function Root({ children }) {
  return (
    <FluentProvider theme={theme} style={{ minHeight: '100vh', background: tokens.colorNeutralBackground2 }}>
      {children}
    </FluentProvider>
  );
}
