import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';  // New: Polyfills Buffer, global, etc.

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({  // Configures Buffer polyfill for browser (no globals option needed for basic use)
      buffer: true,  // Enables Buffer polyfill specifically for bn.js/crypto deps
    }),
  ],
  define: {
    global: 'globalThis',  // Fallback for any remaining Node globals
  },
  optimizeDeps: {
    include: ['@xyflow/react'],  // Prior fix for xyflow
  },
  server: {
    port: 5173,  // Optional: Consistent port
  },
});