# Wallet Demo · Barbería El Filo

Panel web de fidelidad para la barbería: escanea el QR de la tarjeta del cliente, marca la visita (+1 sello) y canjea el corte gratis al llegar a 10 sellos.

- `index.html`: la app (HTML estático + Supabase JS, html5-qrcode y qrcodejs desde CDN).
- `schema.sql`: tablas `clientes` y `visitas`, RLS y las funciones `registrar_sello` / `canjear_corte`.

Solo usa la llave **publishable** de Supabase; todo el acceso pasa por RLS y requiere sesión del barbero.
