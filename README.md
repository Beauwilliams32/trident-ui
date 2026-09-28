# @trident/ui

The Trident design system: tokens, themes, self-hosted fonts and React 19 components for the
Trident Studio fleet, Williams Media, the portfolio and Quorum. The contract is
[`docs/SPEC.md`](docs/SPEC.md); differences are in [`docs/DEVIATIONS.md`](docs/DEVIATIONS.md).

> Public repo. Client themes (Kula, Corner Bar, Filippa) live in the
> client repos and build on the token contract; they are not here.

## Install

```json
"@trident/ui": "github:Beauwilliams32/trident-ui#v0.x.y"
```

`dist/` is committed on release tags only, and there is no `prepare` script, so an install is a
tarball fetch. Keep a `DESIGN-VERSION` file in sync with the pin ([convention](docs/DESIGN-VERSION.md)).

## Use

```html
<html data-theme="trident-ops" data-scheme="dark">
```

```js
import '@trident/ui/fonts/fonts.css'          // or one family: fonts/inter.css
import '@trident/ui/tokens.css'
import '@trident/ui/themes/trident-ops.css'
import '@trident/ui/styles.css'
import { ensureContrast, accentVars } from '@trident/ui'
import { THREE_COLORS } from '@trident/ui/three.mjs'
import { durations, springs } from '@trident/ui/tokens.mjs'
```

| Export | Contents |
|---|---|
| `tokens.css`, `themes/<name>.css`, `styles.css` | Zero-JS CSS. Themes: `fleet`, `trident-studio`, `trident-nil`, `trident-ops`, `trident-playbook`, `trident-tools`, `trident-agents`, `wmh-portal`, `wmh-marketing`, `wmh-dark`, `portfolio`, `quorum`, `legacy-aliases` |
| `tokens.json`, `tokens.mjs`, `three.mjs` | JS tokens; generated three.js hex ints and Quorum's FALLBACK map |
| `.` | React components (a11y, layout, type, actions, forms, display, feedback) + utils |
| `server`, `islands`, `motion-lite`, `motion`, `app`, `three` | Separate entries; `motion`, `app` and `three` need their optional peers |
| `fonts/*` | Variable woff2 (latin + latin-ext), per-family CSS, OFL licences |
| `eslint` | `restrictedSurfaces()` for money/auth/legal/admin directories ([docs](docs/ESLINT.md)) |

CLI: `npx trident-ui copy-assets <dir> [--fonts inter,space-grotesk]`,
`npx trident-ui sync-tokens <dir> [--themes trident-ops]`.

## Develop

```bash
npm ci
npm run build        # tokens -> vite lib -> tsup .d.ts -> styles.css -> export check
npm test             # vitest + jsdom + axe; includes the contrast matrix
npm run lint
npm run typecheck
npm run check:dist   # dist-matches-source
npm run fonts:sync   # after bumping an @fontsource-variable/* package
```

`tokens.json` is the single source. Never edit `dist/`.

Component groups live in `src/<group>/` (`index.ts` + optional `styles.css`, concatenated into
`dist/styles.css` in a fixed order), so builders only touch their own directory.
Record changes with `npx changeset`.
