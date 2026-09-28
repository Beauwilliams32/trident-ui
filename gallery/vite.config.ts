import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The static gallery (spec §10.6): every src/<group>/*.gallery.tsx example, per theme and motion
// state. It reads the built CSS from dist/, so `npm run build` runs first (see gallery:build).
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [react()],
  logLevel: 'warn',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    // three + R3F are bundled for manual browsing with motion on; tests only ever show posters.
    chunkSizeWarningLimit: 2000,
    // One deterministic bundle; the gallery is a test fixture, not a product surface.
    rolldownOptions: { output: { entryFileNames: 'gallery.js', assetFileNames: 'assets/[name][extname]' } },
  },
  preview: { port: 4318, strictPort: true },
})
