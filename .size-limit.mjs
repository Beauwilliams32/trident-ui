// Bundle budgets (spec §1, §9). All sizes gzip. JS is bundled + minified with esbuild; React is
// the consumer's (a peer), so it is ignored. Run after `npm run build:lib`: `npm run size`.
import { readdirSync } from 'node:fs'

const PEERS = ['react', 'react-dom', 'react/*', 'react-dom/*']
const css = (name, path, limit) => ({ name, path, limit, gzip: true })
const js = (name, path, limit, extra = {}) => ({ name, path, limit, gzip: true, ignore: PEERS, ...extra })

const themes = readdirSync(new URL('./dist/themes/', import.meta.url))
  .filter((f) => f.endsWith('.css'))
  .sort()
  .map((f) => css(`theme ${f}`, `dist/themes/${f}`, '12 kB'))

export default [
  css('styles.css (shared component CSS)', 'dist/styles.css', '25 kB'),
  css('tokens.css', 'dist/tokens.css', '12 kB'),
  ...themes,
  // hydrateIslands(), about 2KB (spec §1).
  js('@trident/ui/islands hydrateIslands()', 'dist/islands.js', '2 kB', { import: '{ hydrateIslands }' }),
  // motion-lite, about 2KB (spec §1). The page boot call, and the whole entry.
  js('@trident/ui/motion-lite initMotion()', 'dist/motion-lite.js', '3 kB', { import: '{ initMotion }' }),
  js('@trident/ui/motion-lite (entry)', 'dist/motion-lite.js', '3.5 kB'),
  // The lazy 3D chunk with three + R3F + drei: never in the initial graph, ≤250KB gz (spec §6.6, §9).
  // size-limit treats every peer as external; three, R3F and drei are optional peers but ship in
  // this chunk, so only React stays external here.
  // CI (official Node 24, Chromium zlib) measures about 0.5% above macOS Homebrew Node (system zlib):
  // judge headroom by the CI number (docs/DEVIATIONS.md, 2026-10-02).
  js('@trident/ui/three lazy scene chunk (with three, R3F, drei)', 'dist/chunks/scene-*.js', '250 kB', {
    modifyEsbuildConfig: (config) => ({ ...config, external: PEERS }),
  }),
  // App compositions with their Radix + cmdk peers bundled (what an app shell actually ships; spec
  // §9: app-shell initial JS <= 180 kB gz including react-vendor). Set at the first measurement + ~5%.
  js('@trident/ui/app (with Radix and cmdk)', 'dist/app.js', '51 kB', {
    modifyEsbuildConfig: (config) => ({ ...config, external: PEERS }),
  }),
  // Marketing compositions (root components + motion-lite + JSON-LD builders), no optional peers.
  js('@trident/ui/marketing (entry)', 'dist/marketing.js', '6.2 kB'),
  // Root entry (no spec budget): guards the §9 "no bundle regression above 5%" rule. Set to the
  // v0.1 measurement + 5%; raise it deliberately in review, never silently.
  js('@trident/ui (root entry)', 'dist/index.js', '11.9 kB'),
]
