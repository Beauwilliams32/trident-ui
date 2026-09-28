import { defineConfig } from 'tsup'
import { ENTRIES } from './entries.config.mjs'

// tsup emits the .d.ts files only; JavaScript comes from Vite library mode (vite.config.ts).
export default defineConfig({
  entry: ENTRIES,
  outDir: 'dist',
  format: ['esm'],
  dts: { only: true },
  clean: false,
  tsconfig: 'tsconfig.build.json',
})
