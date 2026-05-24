import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Studio backend (LLM + drafts)
      '/studio': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
      // we-mp-rss
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/feed': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
