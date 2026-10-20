# Brand: the Trident Studio brand system in @trident/ui

Status: rolled out on branch `feat/brand-system-20261020`, **for owner creative review** (2026-10-20).
Nothing here ships in a release until Beau signs it off.

Tagline (proposed): **One system, every screen.** Audience: Trident developers and designers building
screens. Voice: calm, precise, warm.

`@trident/ui` is the design system of record. From 2026-10-20 the **Trident Studio brand system**, not
the Trident Glass framework (`trident-glass.css`, `--tg-*`), is the source of truth for the studio
family. Trident Glass stays in the package as the `fleet` base and the `trident-*` product themes, and
its `--tg-*` names stay in `themes/legacy-aliases.css`, so nothing that uses them breaks. New work
starts from the two themes below.

Where the design lives (outside this repo): `build/brand-systems/ui/` holds the 7-page `brand-book.pdf`
(the picture to match), `DESIGN.md`, `tokens.css`, `tokens.json` and `assets/` (tile, icons, lockups and the link-preview card). This repo carries a
copy of the artwork (`brand/`), the brand's own token file (`brand/trident-ui.tokens.json`) and the
themes built from it. `test/brand.test.ts` fails if any of them drift.

## Use it

```html
<html data-theme="trident-ui" data-scheme="dark">      <!-- dark, the brand default -->
<html data-theme="trident-ui-light" data-scheme="light">
```

```js
import '@trident/ui/fonts/fonts.css'                // Playfair Display, Inter, JetBrains Mono, self-hosted
import '@trident/ui/tokens.css'
import '@trident/ui/themes/trident-ui.css'          // or trident-ui-light.css
import '@trident/ui/styles.css'
```

Import order matters: a theme file re-points a few global names (`--ui-dur`, `--ui-text-base`, ...), so
it must come after `tokens.css`. In your own CSS use the variables, never raw hex values:
`var(--ui-accent-1)`, `var(--ui-surface)`, `var(--ui-ink)`. Primary buttons use the accent gradient with
`--ui-on-accent` text, links use `--ui-accent-text`, and focus rings use `--ui-focus` at 2 px.

Each theme is one scheme (dark or light), like every theme in this package; the brand's own
`data-theme="dark" | "light"` pair is two theme names here.

A product that keeps its own accent pair (the brand rule is one pair per product) uses a theme and
overrides `--ui-accent-1`, `--ui-accent-2` with `accentVars()` / `ensureContrast()`, which also derive
`--ui-on-accent` and `--ui-accent-text`.

## The tile

The product tile is the app icon, favicon source and avatar: a rounded square (22% corners), gradient
`#19C3B1` to `#5B6CFF` at 135 degrees, the `layers` glyph at 62% of the tile. Nothing inside the tile
except the glyph. The artwork was drawn in Adobe Illustrator and is copied, never redrawn.

| File | Size | Use |
|---|---|---|
| `brand/tile.svg` | 512 vector | App icon, avatar, favicon source |
| `brand/tile-bleed.svg` | 512 vector | Full-bleed square for stores that round the corners themselves |
| `brand/tile-maskable.svg` | 512 vector | Maskable PWA source |
| `brand/glyph-white.svg` | 512 vector | The white glyph alone |
| `brand/icon-192.png`, `brand/icon-512.png` | 192, 512 | Web app manifest icons |
| `brand/icon-maskable-512.png` | 512, opaque | Manifest icon, `purpose: "maskable"` |
| `brand/apple-touch-icon.png` | 180, opaque | iOS home screen |
| `brand/app-icon-1024.png` | 1024, opaque | iOS and macOS app icon catalog source |
| `brand/favicon.ico` | 16, 32, 48 | Legacy favicon |

Rules: keep a quarter of the tile free on every side; 16px is the smallest size; never rotate, recolour
or add text inside the tile; the product name next to it is live text in the display face, with
"By Trident Studio" as the credit. Where words cannot be live text, use the supplied lockups below. The
gallery's **Brand** section shows the tile at 16 to 128px, the live-text lockup, the supplied lockups and
link-preview card, and every icon file.

## Lockups and the link-preview card

Four more supplied files sit beside the tile in `brand/`. They were drawn in Adobe Illustrator with the
text outlined, so they need no font, and they are copied, never redrawn or retyped.

| File | Size | Use |
|---|---|---|
| `brand/lockup-dark.svg` | 640 x 160 vector, transparent | The tile, "Trident UI" in white and "By Trident Studio" in teal (`#19C3B1`), for dark surfaces |
| `brand/lockup-light.svg` | 640 x 160 vector, transparent | The same lockup in near-black (`#0B0B0D`) and dark teal (`#0F756A`), for light surfaces |
| `brand/og-card.png` | 1200 x 630, opaque, under 1 MB | The link-preview card: the tile on the brand navy, "Trident UI", "One system, every screen." and "A Trident Studio product" |
| `brand/og-card.svg` | 1200 x 630 vector | The vector source of the card, for other sizes |

The lockups are for static surfaces where the name cannot be live text: README headers, docs banners,
decks, store art. This repo's README header is a `<picture>` that swaps the two files by colour scheme.
In a product's UI the name stays live text in the display face beside the tile (gallery Brand, "Lockup").
The credit line is small by design; below about 200px wide use the tile alone. The art sits on the left of
its 640px canvas, so left-align it.

**This repo has no public page to carry the card.** The gallery is a test fixture that is built for the
screenshot tests and not hosted, so no `og:image` tag points at the card here. A product page that wants
a link preview copies `og-card.png` to its own public folder and serves it from its own absolute URL
(crawlers do not follow a package path). The card says "Trident UI", so only use it for Trident UI's own
pages; other products use their own card from their own brand system.

```html
<meta property="og:image" content="https://YOUR-HOST/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Trident UI. One system, every screen. A Trident Studio product.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://YOUR-HOST/og-card.png">
```

The Depth Line three-rail mark (`brand/depth-line.*`, approved 2026-10-07) is superseded by the tile.
Its files stay unchanged so existing imports keep resolving; removing them is a major-version change.

## Colour

The brand's tokens map onto the existing `--ui-*` role names, so components and the contrast matrix
need no changes. **Brand** values are used as given; **derived** values have no brand equivalent and are
computed from the brand values (rule in the last column).

| Role | `trident-ui` (dark) | `trident-ui-light` | Source |
|---|---|---|---|
| `--ui-bg` | `#0B1927` | `#E8F3F3` | brand `bg` |
| `--ui-surface` | `#0C222E` | `#FFFFFF` | brand `surface` |
| `--ui-line` | `#0D343D` | `#BEDADA` | brand `line` (hairlines, not control borders) |
| `--ui-ink` | `#FFFFFF` | `#0B0B0D` | brand `text` |
| `--ui-muted` | `#9AA7BD` | `#56627A` | brand `muted` |
| `--ui-accent-1`, `--ui-accent-2` | `#19C3B1`, `#5B6CFF` | same | brand `accent`, `accent-2` (tile gradient ends) |
| `--ui-accent-text`, `--ui-focus` | `#19C3B1` | `#0F756A` | brand `link` |
| `--ui-on-accent` | `#0B0B0D` | `#0B0B0D` | brand `on-accent` |
| `--ui-ok`, `--ui-warn`, `--ui-danger`, `--ui-info` | `#2FD39A`, `#F5B83D`, `#FF6B5E`, `#3BA8F0` | `#186A4D`, `#7B5C1F`, `#A6463D`, `#236590` | dark: brand signals. Light: each brand signal mixed toward black in 5% steps until it reaches 4.5:1 on bg, bg-2 and surface and still 4.5:1 on a 10% pressed overlay (the brand's signal fills are for tiles and tinted chips, not text) |
| `--ui-bg-2` | `#0C1E2B` | `#F4F9F9` | derived: bg and surface mixed 50% |
| `--ui-surface-raised` | `#0D2B36` | `#FFFFFF` | derived: surface and line mixed 50% (dark) |
| `--ui-ink-2` | `#D7DCE5` | `#292E39` | derived: ink mixed 40% toward muted |
| `--ui-line-strong` | `#616E81` | `#7B8698` | derived: bg mixed toward muted until 3:1 on bg, bg-2 and surface (60% dark, 75% light); control borders use this |
| `--ui-status-reasoning` | `#9DA7FF` | `#3E49AD` | brand indigo scale, step 300 (dark) and 700 (light) |
| `--ui-glass`, `--ui-glass-strong`, `--ui-glass-edge` | surface, surface-raised, line | same | the brand is flat and opaque: no translucency |

The full teal and indigo scales (50 to 900) are primitives: `--p-studio-teal-*` and `--p-studio-indigo-*`.
`--ui-accent-grad` is the tile gradient. Charts use the accent for the first series and accent-2 for the
second.

Measured (the worst of bg, bg-2 and surface), from `test/brand.test.ts` and the contrast matrix:

| Pair | Dark | Light |
|---|---|---|
| ink / ink-2 / muted | 16.4 / 11.9 / 6.7 | 17.4 / 12.0 / 5.4 |
| accent-text and focus | 7.4 | 4.9 |
| ok / warn / danger / info | 8.5 / 9.2 / 5.9 / 6.3 | 5.8 / 5.5 / 5.2 / 5.6 |
| line-strong (controls) | 3.2 | 3.3 |
| on-accent on accent-1 / accent-2 | 8.9 / 4.7 | 8.9 / 4.7 |

Increase Contrast (`prefers-contrast: more`) overrides are generated for both themes like every other.

## Type

| Role | Value | Notes |
|---|---|---|
| `--ui-font-display` | Playfair Display, Bold | Headlines and numbers; `--ui-weight-display` is 700 in these themes |
| `--ui-font-body` | Inter | Body, UI and forms |
| `--ui-font-mono` | JetBrains Mono | Tokens, IDs, commands |

All three are self-hosted (`fonts/`, OFL-1.1) with metric-matched fallbacks; there is no Google Fonts
connection. The brand scale 72 / 40 / 24 / 17 / 13 px maps onto the existing size names:

| Brand | Existing name | Value in the studio themes |
|---|---|---|
| Display 72 | `--ui-text-display` | `clamp(40px, 6vw, 72px)` |
| Heading 40 | `--ui-text-4xl` | `clamp(36px, 5.5vw, 40px)` |
| Subhead 24 | `--ui-text-xl` | unchanged, `clamp(22px, 2vw, 24px)` |
| Body 17 | `--ui-text-base` | `17px` (body never below 16px on screen) |
| Caption 13 | `--ui-text-xs` | unchanged, `13px` |

Line length 60 to 75 characters. The brand book's layout (12 columns, 1200px content width, 24px gutters
on desktop and 16px on phones) is guidance, not a token: the package's `--ui-grid-*` tokens (12 columns,
1080px marketing and 1280px app content widths, 16 to 32px fluid gutters) are unchanged.

## Space, radius, motion, elevation

| Brand | Existing name |
|---|---|
| space 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 | `--ui-space-1 / 2 / 3 / 4 / 6 / 8 / 12 / 16`. The brand's own numbering differs from ours (brand `--space-5` is 24px, our `--ui-space-5` is 20px), so map by value |
| radius sm / md / lg / xl / pill = 6 / 10 / 16 / 24 / 999 | `--ui-r-xs / --ui-r-sm / --ui-r / --ui-r-lg / --ui-r-pill` (`--ui-r-lg` is 24px in the studio themes, 22px elsewhere) |
| motion fast / base / slow = 160 / 240 / 320 ms | `--ui-dur-fast` (160), `--ui-dur` (240 in the studio themes, 200 elsewhere), `--ui-dur-med` (320) |
| easing `cubic-bezier(.2,.8,.2,1)` | `--ui-ease` (identical) |
| shadow raised / overlay | `--ui-shadow-raised`, `--ui-shadow-overlay`, used by `--ui-e2` and `--ui-e3` |

Motion stays 160 to 320 ms for interface motion, transform and opacity only, and honours reduced
motion through the package's global kill switch. The longer reveal, count-up and 3D timings that
already existed are unchanged.

## Voice

We do: plain, calm sentences; explain it in ten seconds; name the next step.
We don't: use jargon, hype or exclamation marks.

## Rules

- One accent pair per product. Do not add colours for one-off pages.
- Keep the product's existing credit line in the footer (Trident Studio where it has one).
- Contrast: 4.5:1 for text, 3:1 for large text and UI borders. New colour pairs must pass.
- Motion 160 to 320 ms, transform and opacity only, and honour reduced motion.
- Nothing inside the tile except the glyph.

## Not changed

Components, props, class names, routes, copy and behaviour are unchanged. Every existing theme keeps its
values, so `trident-studio`, `trident-ops`, `wmh-*` and the rest render exactly as before. The two new
themes are additive (a minor release).
