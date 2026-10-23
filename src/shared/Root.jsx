import { FluentProvider, webLightTheme, tokens } from '@fluentui/react-components';

// Colores y tipografía de la tarjeta de sellos (réplica del pase de Wallet); la interfaz usa el tema nativo de Fluent
export const GOLD = '#C9A227';
export const display = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' };

export function Root({ children }) {
  return (
    <FluentProvider theme={webLightTheme} style={{ minHeight: '100vh', background: tokens.colorNeutralBackground2 }}>
      {children}
    </FluentProvider>
  );
}
