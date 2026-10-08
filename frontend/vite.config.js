import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite + React configuration for the WayHome frontend.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: false,
    allowedHosts: ["terminal.local"],
    open: false,
  },
  build: {
    outDir: 'dist',
    // Strip all console.* and debugger statements from production bundles
    minify: 'esbuild',
    esbuildOptions: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  },
}));
