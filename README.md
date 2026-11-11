<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/lockup-dark.svg">
    <img src="brand/lockup-light.svg" alt="Trident UI, by Trident Studio" width="360" height="90">
  </picture>
</p>

# @trident/ui

The Trident design system: tokens, themes, self-hosted fonts and React 19 components for the
Trident Studio fleet, Williams Media, the portfolio and Quorum. The contract is
[`docs/SPEC.md`](docs/SPEC.md); differences are in [`docs/DEVIATIONS.md`](docs/DEVIATIONS.md). The
brand (tile, colour, type, voice) is the Trident Studio brand system: [`docs/BRAND.md`](docs/BRAND.md).

> Public repo. Client themes (Kula, Corner Bar, Filippa) live in the
> client repos and build on the token contract; they are not here.

## Install

```json
"@trident/ui": "github:Beauwilliams32/trident-ui#v0.x.y"
```

`dist/` is committed on release tags only, and no script is named `prepare`, `prepack`, `build`,
`install`, `preinstall` or `postinstall` (npm prepares a git dependency that has any of them, which
means a full dev install in a temp clone), so an install is a plain fetch. The library build is
`npm run build:lib`. `v0.1.0` predates that rename and does not install; pin `v0.1.1` or later. Keep a `DESIGN-VERSION` file in sync with the pin ([convention](docs/DESIGN-VERSION.md)).

## Use

```html
<html data-theme="trident-ui" data-scheme="dark">   <!-- Trident Studio brand, dark; trident-ui-light for light -->
```

```js
import '@trident/ui/fonts/fonts.css'          // or one family: fonts/inter.css
import '@trident/ui/tokens.css'
import '@trident/ui/themes/trident-ui.css'
import '@trident/ui/styles.css'
import { ensureContrast, accentVars } from '@trident/ui'
import { THREE_COLORS } from '@trident/ui/three.mjs'
import { durations, springs } from '@trident/ui/tokens.mjs'
```

Projects that keep their own visual theme can import the small mobile interaction contract instead of the full default palette:

```css
@import '@trident/ui/mobile-contract.css';
```

It supplies shared 44px touch and 48px game targets, focus dimensions, and 160/240/320ms mobile motion tokens. Product colors, typography, surfaces, and component behavior remain project-owned.

| Export | Contents |
|---|---|
| `tokens.css`, `mobile-contract.css`, `themes/<name>.css`, `styles.css` | Zero-JS CSS. `mobile-contract.css` exports only shared touch/focus/motion tokens; themes: `trident-ui`, `trident-ui-light` (the Trident Studio brand), `fleet`, `trident-studio`, `trident-nil`, `trident-ops`, `trident-playbook`, `trident-tools`, `trident-agents`, `wmh-portal`, `wmh-marketing`, `wmh-dark`, `portfolio`, `quorum`, `legacy-aliases` |
| `tokens.json`, `tokens.mjs`, `three.mjs` | JS tokens; generated three.js hex ints and Quorum's FALLBACK map |
| `.` | React components (a11y, layout, type, actions, forms, display, feedback) + utils |
| `app` | Radix overlays (Dialog, Sheet, ConfirmDialog, Popover, Tooltip, DropdownMenu, ContextMenu), Tabs, CommandPalette (cmdk), DataTable, Pagination, EmptyState, Skeleton. Install the Radix/cmdk peers you use |
| `marketing` | Hero, FeatureGrid, PricingTable, Faq, CtaBand, SiteHeader, SiteFooter and a MotionToggle that needs no `motion` peer. Copy and prices only ever come from props |
| `server`, `islands`, `motion-lite`, `motion`, `three` | Separate entries; `motion` and `three` need their optional peers |
| `fonts/*` | Variable woff2 (latin + latin-ext), per-family CSS, OFL licences |
| `brand/*` | The shared Trident Studio house glyph (`studio-glyph-white.svg`, `studio-glyph-ink.svg`) plus Trident UI's own tile and icon files (`tile.svg`, `glyph-white.svg`, manifest, apple-touch, app-icon and favicon files; [`brand/README.md`](brand/README.md)) and its `trident-ui.tokens.json`. The superseded Depth Line mark and contour stay for compatibility |
| `eslint` | `restrictedSurfaces()` for money/auth/legal/admin directories ([docs](docs/ESLINT.md)) |

### Cascade layers: keep legacy resets below the components

`styles.css` puts everything in `@layer ui-base, ui-components, ui-utilities`. **Any unlayered rule
beats every layered rule, whatever its specificity**, so an old global reset such as
`* { margin: 0; padding: 0 }` silently zeroes every Button, Card and Container padding. Ops hit this
and patched it with `margin: revert-layer; padding: revert-layer` under `.ops-landing`. The clean fix
is to put the legacy reset in a layer that is named first:

```css
/* The very first rule of your first stylesheet (before @trident/ui/styles.css):
   name the layers, lowest priority first. */
@layer legacy, ui-base, ui-components, ui-utilities;

/* Then move old global resets into the lowest layer, so component styles win. */
@layer legacy {
  * { margin: 0; padding: 0; }
  a { color: inherit; }
}
```

The order statement must come first: a layer first named later ranks higher, so declaring `legacy`
after importing `styles.css` would put the reset above the components again. Theme and token files
only set custom properties and are unaffected.

### Built in, nothing to wire

- **Touch targets.** On a coarse pointer every button, chip toggle and remove, dismiss button,
  checkbox, radio, switch, tab and sortable header answers taps across at least 44x44 through an
  invisible hit region; the drawn size and the desktop rendering do not change. Leave at least 12px
  between small buttons (20px beside a 24px link button) so neighbouring regions do not overlap.
  Set `gameControl` on `Button`, `LinkButton`, or `IconButton` when a visible 48px target suits a
  game control. `--ui-dur-mobile-fast/base/slow` expose the shared 160/240/320ms mobile motion scale.
  The cross-brand mobile contract and product-owned identity boundaries are documented in
  [`docs/MOBILE-DESIGN-SYSTEM.md`](docs/MOBILE-DESIGN-SYSTEM.md).
- **Increase Contrast.** Each theme ships `@media (prefers-contrast: more)` overrides generated from
  `tokens.json#high-contrast`: ink and muted at 7:1 or more, line-strong at 4.5:1, hairlines and
  glass solid.
- **Links.** Use `TextLink` for links in text. Links inside Alert, Toast and FlashBanner take the
  tone ink and an underline; `ViewTransitionLink` renders `.ui-link` (pass `unstyled` to opt out).
- **Error titles.** `errorTitle(title, errors)` (or `SeoHead errorCount`) gives the GOV.UK
  "Error: " page-title prefix after a failed POST.

CLI: `npx trident-ui copy-assets <dir> [--fonts inter,space-grotesk]`,
`npx trident-ui sync-tokens <dir> [--themes trident-ops]`.

## Develop

```bash
npm ci
npm run build:lib    # tokens -> vite lib -> tsup .d.ts -> styles.css -> export check
npm test             # vitest + jsdom + axe; includes the contrast matrix
npm run lint
npm run typecheck
npm run check:dist   # dist-matches-source
npm run fonts:sync   # after bumping an @fontsource-variable/* package
npm run size         # size-limit budgets (spec §1, §9); run after build
npm run gate         # the merge gate: check + check:dist + gallery build + Playwright visual and axe
```

`npm run check` alone does not run the gallery's Playwright suites. Merge on `npm run gate`, run on
macOS so the visual spec compares against the committed baselines (it skips elsewhere).

### Gallery (spec §10.6)

`gallery/` renders every `src/<group>/*.gallery.tsx` example in every theme (each in its native
scheme), under reduced motion and the Pause-motion control, at 360px and 1280px, after three
documentation sections from `gallery/docs/` (Getting started, Design tokens, Brand). Every example
has a "when to use it" line, a Code disclosure with its own source (extracted at build time) and a
copy button; every component group ends with props tables generated from `dist/*.d.ts`. A sticky
section list (1024px and up) or a "Jump to" menu (phones) navigates it, and the theme and motion
links keep `?group=` and the `#hash`. It reads the built CSS and types, so build first.

```bash
npm run build:lib && npm run gallery:build
npm run gallery:dev      # browse: ?theme=<name>&motion=reduced|paused&group=<group>
npm run gallery:e2e      # Playwright: screenshots (macOS baselines), axe, keyboard journeys,
                         # touch targets and the measured checks in measure.spec.ts, local Chromium
npm run gallery:axe      # axe only (also runs in CI)
npm run gallery:update   # re-record screenshots after an intended visual change
```

Screenshots use `toHaveScreenshot` (fonts self-hosted, animations disabled, maxDiffPixelRatio
0.001); baselines live in `gallery/tests/__screenshots__/<platform>/`. 3D appears only through
`PosterFallback`: the suite asserts no `<canvas>` exists. Visual finals still go through the
owner's creative review gate.

`tokens.json` is the single source. Never edit `dist/`.

Component groups live in `src/<group>/` (`index.ts` + optional `styles.css`, concatenated into
`dist/styles.css` in a fixed order), so builders only touch their own directory.
Record changes with `npx changeset`.
