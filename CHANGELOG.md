# @trident/ui

Managed with [Changesets](https://github.com/changesets/changesets) (`npx changeset`). Bump rules
are in `.changeset/README.md`: a contrast-affecting change is **major**, a new theme is **minor**,
and any rendered-colour change needs an entry here.

## Unreleased

**Rendered colour changes** (no colour role in the contrast matrix changed value):

- Links inside `Alert` (including its `actions`), `Toast` and `FlashBanner` now take the tone ink
  (`--ui-tone-ink`) with an underline. They used to fall back to the browser's default link colour
  (`rgb(158,158,255)` in dark themes, UA blue on `wmh-portal`). `LinkButton`s are unaffected.
- `ViewTransitionLink` now renders the themed `.ui-link` look (`--ui-accent-text`, underlined). Pass
  `unstyled` to keep a bare link that its container styles.
- Each theme gains `@media (prefers-contrast: more)` overrides (Increase Contrast): ink and muted at
  7:1 or more, line-strong at 4.5:1, hairlines as the old strong line, glass solid. Generated from
  `tokens.json#high-contrast`; nothing changes for users without that setting.

**Fixes**

- A static `Chip` no longer gets double start padding (its label sat 19px from the start and 10px
  from the end).
- The procedural `PosterFallback` glow now fades out inside the slot instead of being cut off by its
  edges into a hard-edged rectangle.
- `Alert` and `Toast` dismiss buttons use logical margins, so they tuck into the inline end in
  right-to-left pages too.
- The visible `StatusOrbitList` shows each state as a status pill (text unchanged).

**Touch** (coarse pointers only; desktop rendering is unchanged):

- Buttons, icon buttons, chip toggles and remove buttons, Alert and Toast dismiss, checkboxes,
  radios, switches, tabs, sortable headers and the Pause-motion control answer taps across at least
  44x44 through invisible hit regions. Text inputs are 44px tall, fieldset options sit 20px apart,
  and interactive chips take 8px more room around them so neighbouring regions never overlap.

**New**

- `TextLink`; `errorTitle()` / `errorCount()` and `SeoHead` `errorCount` (the GOV.UK "Error: " title
  prefix); `PosterFallback` `loading` and `fetchPriority`.
- `@trident/ui/app`: Dialog, Sheet, ConfirmDialog, Popover, Tooltip, DropdownMenu, ContextMenu, Tabs,
  CommandPalette, DataTable, Pagination, EmptyState, Skeleton (Radix and cmdk optional peers).
- `@trident/ui/marketing`: Hero, FeatureGrid, PricingTable, Faq, CtaBand, SiteHeader, SiteFooter and
  a `MotionToggle` that needs no `motion` peer.
- Gallery: Getting started, Design tokens and Brand sections; a "when to use" line, the source and a
  copy button on every example; props tables generated from the `.d.ts`; section navigation; RTL
  examples; README section on cascade layers.

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
