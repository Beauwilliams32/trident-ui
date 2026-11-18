import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { ENTRIES, EXTERNAL } from './entries.config.mjs'

// Vite 8 library mode: ESM JavaScript for every subpath entry. Types come from tsup (tsup.config.ts);
// CSS/tokens come from scripts/build-tokens.mjs and scripts/build-styles.mjs.
export default defineConfig({
  // This library emits its approved glyph beside the entry; keep its URL package-relative.
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    sourcemap: false,
    target: 'es2022',
    lib: {
      entry: Object.fromEntries(Object.entries(ENTRIES).map(([name, file]) => [name, resolve(import.meta.dirname, file)])),
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rolldownOptions: {
      external: (id) => EXTERNAL.test(id),
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
