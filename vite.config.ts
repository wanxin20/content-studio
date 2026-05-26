import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // react-icons exports thousands of components; pre-bundling the deep
    // path makes the optimizer scan complete instead of hanging on the
    // metadata-heavy top-level index. Listing the few sub-packs we use.
    include: ['react-icons/si'],
  },
  server: {
    port: 5175,
    host: '127.0.0.1',
    proxy: {
      // Studio backend (LLM + drafts)
      '/studio': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
      // we-mp-rss（远端）
      '/api': {
        target: 'http://8.166.135.233:8001',
        changeOrigin: true,
      },
      '/feed': {
        target: 'http://8.166.135.233:8001',
        changeOrigin: true,
      },
    },
  },
});
