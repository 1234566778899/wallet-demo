import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: { input: { panel: 'index.html', tarjeta: 'tarjeta.html' } },
  },
  // En desarrollo, /api apunta al despliegue de Vercel
  server: { proxy: { '/api': 'https://wallet-demo-chi.vercel.app' } },
});
