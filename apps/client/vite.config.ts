import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: path.resolve(__dirname, '../../.cache/vite-client'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: Number(process.env.CLIENT_PORT ?? 5173),
  },
});
