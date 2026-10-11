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
| Depth Line fleet mark and optional public-page contour motif | `brand/depth-line.mjs`, `brand/depth-line.css`, `brand/depth-line-contours.svg` | yes | `test/depth-line.test.ts` |
| `trident-ui copy-assets` / `sync-tokens` | `bin/trident-ui.mjs` | yes | `test/cli.test.ts` |
| Package contract (exports, peers, no script that makes npm prepare the git dependency) | `package.json` | yes | `test/package.test.ts` |
| Consumer ESLint rule for restricted surfaces | `eslint/restricted-surfaces.js` | yes | `test/eslint-convention.test.ts` |
| Toolchain: React 19 + Testing Library + axe | `test/setup.ts` | yes | `test/axe-smoke.test.tsx` |
| dist-matches-source | `scripts/dist-matches-source.mjs` | CI | `.github/workflows/ci.yml` |
| a11y group: SkipLink, VisuallyHidden, LiveAnnouncer, FocusRing | `src/a11y/` | yes | `test/a11y/a11y.test.tsx`, `test/a11y/ssr.test.tsx` |
| layout group: Container, Stack, Cluster, Grid, Section | `src/layout/` | yes | `test/layout/layout.test.tsx` |
| type group: Heading (+ outline check), Text, Kicker, GradText, Mono, Code, Kbd, Prose | `src/type/` | yes | `test/type/type.test.tsx` |
| actions group: Button, LinkButton, IconButton | `src/actions/` | yes | `src/actions/actions.test.tsx` |
| forms group: Form + CSRF, Field, controls, FormError, ErrorSummary, SubmitButton | `src/forms/` | yes | `src/forms/forms.test.tsx` |
| display group: Badge, StatusPill, Chip, Avatar, Card, StatCard | `src/display/` | yes | `src/display/display.test.tsx`, `src/display/ssr.test.tsx`, `src/display/theme-smoke.test.tsx`, `src/display/tone.test.ts` |
| feedback group: Alert, FlashBanner, Toast | `src/feedback/` | yes | `src/feedback/feedback.test.tsx`, `src/feedback/ssr.test.tsx`, `src/feedback/theme-smoke.test.tsx`, `src/feedback/feedback-contrast.test.ts` |
| server entry: SeoHead, JSON-LD, renderPage, Island markup, theme schemes | `src/server/` | yes | `src/server/SeoHead.test.tsx`, `src/server/jsonld.test.ts`, `src/server/renderPage.test.tsx`, `src/server/Island.test.tsx`, `src/server/themes.test.ts` |
| islands entry: `hydrateIslands()` + 2 kB budget | `src/islands/` | yes | `src/islands/hydrate.test.tsx`, `src/islands/budget.test.ts`, `src/islands/gallery.test.tsx` |
| motion-lite entry: reveal, count-up, tilt, Pause store, view transitions | `src/motion-lite/` | yes | `src/motion-lite/motion-lite.test.ts`, `src/motion-lite/size.test.ts`, `src/motion-lite/ssr.test.ts` |
| motion entry: MotionRoot, Reveal, CountUp, Tilt, ViewTransitionLink, AmbientGlow, MotionToggle | `src/motion/` | yes | `src/motion/motion.test.tsx` |
| three entry: Lazy3D gating, PosterFallback, StatusOrbit, quality tier, FPS guard, token colours | `src/three/` | yes | `src/three/__tests__/Lazy3D.test.tsx`, `src/three/__tests__/SceneCanvas.test.tsx`, `src/three/__tests__/guards.test.ts`, `src/three/__tests__/a11y-hooks.test.tsx`, `src/three/__tests__/ssr.test.tsx`, `src/three/__tests__/units.test.ts` |
| three entry: lazy colour table precomputed from tokens.json (`generated-colors.json`, written by `npm run build:tokens`, sync-tested) so the 3D payload never carries tokens.json | `src/three/generated.ts`, `src/three/generated-colors.json`, `scripts/build-tokens.mjs` | yes | `src/three/__tests__/units.test.ts` |
| Touch targets: on `(pointer: coarse)` every interactive control (Button, IconButton, LinkButton, chip toggle/remove, Alert/Toast dismiss, checkbox/radio/switch, Pause motion) answers taps across at least 44x44 via an invisible hit region; drawn size and desktop rendering unchanged | `src/actions/styles.css`, `src/forms/styles.css`, `src/display/styles.css`, `src/feedback/styles.css`, `src/motion-lite/styles.css` | yes (macOS, `npm run gate`) | `gallery/tests/touch.spec.ts` |
| Increase Contrast: per-theme `@media (prefers-contrast: more)` overrides generated from `tokens.json#high-contrast` (ink and muted >= 7:1, line-strong >= 4.5:1, hairlines and glass solid) | `tokens.json`, `scripts/lib/tokens.mjs` | yes | `test/contrast-matrix.test.ts` |
| `errorTitle()` / `errorCount()` and `SeoHead` `errorCount`: the GOV.UK "Error: " page-title prefix after a failed POST | `src/forms/errorTitle.ts`, `src/server/SeoHead.tsx` | yes | `src/forms/errorTitle.test.ts`, `src/server/SeoHead.test.tsx` |
| `TextLink` (`.ui-link`): themed, underlined inline link (accent-text or inherited tone, hover-only underline for navigation, safe new-tab rel plus a screen-reader hint) | `src/type/TextLink.tsx`, `src/type/styles.css` | yes | `test/type/text-link.test.tsx` |
| `PosterFallback` `loading` and `fetchPriority` (an eager, low-priority decorative backdrop; same markup Ops hand-wrote) | `src/three/PosterFallback.tsx` | yes | `src/three/__tests__/poster.test.tsx` |
| app entry (Radix, cmdk, sonner compositions) | `src/app/` | no: the entry is an empty placeholder in v0.1 | none |
| Root entry never reaches three / R3F or a subpath-only group | `src/index.ts` | yes | `test/root-entry.test.ts` |
| Static gallery: every `*.gallery.tsx` example × 12 themes × reduced/paused × 360/1280 | `gallery/` | yes | `gallery/tests/visual.spec.ts`, `gallery/tests/axe.spec.ts` |
| Visual regression: 576 macOS baselines, maxDiffPixelRatio 0.001, posters only (no canvas) | `gallery/tests/__screenshots__/darwin/` | yes (macOS, `npm run gate`) | `gallery/tests/visual.spec.ts` |
| Gallery axe, WCAG 2.2 AA, zero violations on 48 pages, sampled only once CSS transitions settle (`openGallery`) | `gallery/tests/axe.spec.ts` | yes (CI + `npm run gate`) | `gallery/tests/axe.spec.ts` |
| Bundle budgets (styles, tokens, themes, islands, motion-lite, lazy 3D chunk, root) | `.size-limit.mjs` | yes (`npm run size`) | `.size-limit.mjs` |
| Full local gate: check + check:dist + gallery build + Playwright visual and axe | `package.json#scripts.gate` | yes | `test/feature-map.test.ts` |
| FEATURE-MAP covers every source group and cites only files that exist | `FEATURE-MAP.md` | yes | `test/feature-map.test.ts` |
