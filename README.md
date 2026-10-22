# Wallet Demo · Barbería El Filo

Panel web de fidelidad para la barbería: escanea el QR de la tarjeta del cliente, marca la visita (+1 sello) y canjea el corte gratis al llegar a 10 sellos.

- `index.html`: la app (HTML estático + Supabase JS, html5-qrcode y qrcodejs desde CDN).
- `schema.sql`: tablas `clientes` y `visitas`, RLS y las funciones `registrar_sello` / `canjear_corte`.

Solo usa la llave **publishable** de Supabase; todo el acceso pasa por RLS y requiere sesión del barbero.

## Apple Wallet

- `tarjeta.html` (`/tarjeta`): el cliente crea su tarjeta y la agrega a Apple Wallet.
- `api/pass.js`: genera y firma el `.pkpass` (Pass Type ID `pass.com.carlosordaz.elfilo`).
- `api/wallet.js`: web service de Apple Wallet (registro de dispositivos y actualización del pase).
- `api/push.js`: el panel lo llama tras cada sello para que el pase se actualice vía APNs.
- `wallet.sql`: columnas y funciones de base de datos para Wallet.

Variable de entorno requerida en Vercel: `PASS_KEY_B64` (llave privada del certificado del pase en base64). Nunca se sube al repo.
