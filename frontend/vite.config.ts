import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@xyflow/react'],  // Forces Vite to pre-bundle and resolve named exports like Connection, Node, Edge
  },
  server: {
    port: 5173,  // Default; optional for consistency
  },
})