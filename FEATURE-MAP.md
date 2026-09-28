# FEATURE-MAP — @trident/ui

| Feature | Where | Tested | Test file |
|---|---|---|---|
| tokens.json single source -> tokens.css / themes / tokens.mjs / three.mjs | `tokens.json`, `scripts/lib/tokens.mjs`, `scripts/build-tokens.mjs` | yes | `test/tokens.test.ts` |
| Spec §3 theme values (fleet + 6 accents, wmh-*, portfolio, quorum) | `tokens.json` | yes | `test/tokens.test.ts` |
| Contrast matrix, every theme and palette x §9 pairs | `tokens.json#contrast` | yes | `test/contrast-matrix.test.ts` |
| `ensureContrast` / `accentVars` runtime accents | `src/utils/contrast.ts` | yes | `test/ensure-contrast.test.ts` |
| Quorum FALLBACK generated from tokens | `scripts/lib/tokens.mjs#quorumFallback` | yes | `test/quorum-fallback.test.ts` |
| Legacy aliases (`--tg-*`, `--violet-*`, `--glass-*`, `--dur-*`, Ops, `--q-*`) | `scripts/lib/tokens.mjs#LEGACY_ALIASES` | yes | `test/tokens.test.ts` |
| Base CSS: focus ring, reveal gating + 2.5s failsafe, motion kill switch | `src/styles/base.css` | yes | `test/base-css.test.ts` |
| Self-hosted fonts + metric-matched fallbacks | `fonts/`, `scripts/sync-fonts.mjs` | yes | `test/fonts.test.ts` |
| `trident-ui copy-assets` / `sync-tokens` | `bin/trident-ui.mjs` | yes | `test/cli.test.ts` |
| Package contract (exports, peers, no prepare) | `package.json` | yes | `test/package.test.ts` |
| Consumer ESLint rule for restricted surfaces | `eslint/restricted-surfaces.js` | yes | `test/eslint-convention.test.ts` |
| Toolchain: React 19 + Testing Library + axe | `test/setup.ts` | yes | `test/axe-smoke.test.tsx` |
| dist-matches-source | `scripts/dist-matches-source.mjs` | CI | `.github/workflows/ci.yml` |
