import { useEffect, useState } from 'react';
import { FluentProvider, webDarkTheme, webLightTheme, tokens } from '@fluentui/react-components';

const query = window.matchMedia('(prefers-color-scheme: dark)');

// Proveedor de Fluent que sigue el modo claro/oscuro del sistema
export function Root({ children }) {
  const [dark, setDark] = useState(query.matches);
  useEffect(() => {
    const on = e => setDark(e.matches);
    query.addEventListener('change', on);
    return () => query.removeEventListener('change', on);
  }, []);
  useEffect(() => { document.body.style.background = dark ? '#141414' : '#fafafa'; }, [dark]);
  return (
    <FluentProvider theme={dark ? webDarkTheme : webLightTheme} style={{ minHeight: '100vh', background: tokens.colorNeutralBackground2 }}>
      {children}
    </FluentProvider>
  );
}
