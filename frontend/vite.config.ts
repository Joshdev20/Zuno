import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT ?? 12000),
    strictPort: false,
    allowedHosts: ['.prod-runtime.all-hands.dev', 'localhost'],
    fs: { allow: [path.resolve(import.meta.dirname, '..')] },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
