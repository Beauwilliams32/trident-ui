# @trident/ui

Managed with [Changesets](https://github.com/changesets/changesets) (`npx changeset`). Bump rules
are in `.changeset/README.md`: a contrast-affecting change is **major**, a new theme is **minor**,
and any rendered-colour change needs an entry here.

## Unreleased

- Add the opt-in Depth Line three-rail vector mark, per-product accent support, and static
  decorative contour art for public marketing pages. Existing token colours, components,
  checkout/auth/legal flows and contrast roles are unchanged.

## 0.1.1

- Make the git-tag install a plain fetch. The library build script is now `build:lib`: npm prepares
  a git dependency whose package.json has a `build` script (a full dev install in a temp clone,
  which fails outright under npm 11.12), so `v0.1.0` could not be installed. `test/package.test.ts`
  now bans every script name npm prepares on. No change to `dist/`, tokens or rendered colour.

## 0.1.0

Tag `v0.1.0` (2026-09-30). **Not installable as a git dependency**: see 0.1.1.

- Foundation: tokens.json as the single source, generating `tokens.css`, `themes/*.css`
  (fleet, trident-studio, trident-nil, trident-ops, trident-playbook, trident-tools, trident-agents,
  wmh-portal, wmh-marketing, wmh-dark, portfolio, quorum, legacy-aliases), `tokens.mjs` and
  `three.mjs`.
- `ensureContrast()` / `accentVars()` and a contrast-matrix test over every theme and palette.
- Self-hosted variable fonts (Space Grotesk, Inter, JetBrains Mono, Manrope, Oswald; OFL) with
  metric-matched fallbacks; `trident-ui copy-assets` and `sync-tokens`.
- `@trident/ui/eslint` consumer rule for restricted surfaces.
- Component groups (a11y, layout, type, actions, forms, display, feedback) and the `server`,
  `islands`, `motion-lite`, `motion` and `three` entries; `app` is still an empty placeholder.
- Static gallery with Playwright visual regression (576 macOS baselines) and axe, plus size-limit
  budgets. `npm run gate` runs all of it; `FEATURE-MAP.md` has a row per group, guarded by
  `test/feature-map.test.ts`.
