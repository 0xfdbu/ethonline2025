import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      buffer: true,
    }),
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@xyflow/react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  css: {
    postcss: undefined,  // Disable explicit PostCSS—let Vite's built-in handle Tailwind
  },
});