# Brand

The Trident Studio brand system (approved 2026-10-20), as shipped for Trident UI. The rules,
colour table, token mapping and voice are in [`docs/BRAND.md`](../docs/BRAND.md). Copy supplied
artwork; never redraw it.

The shared Trident Studio house mark is Poseidon's approved bold trident. Use its source files for
cross-project Studio branding. The existing tile and lockup identify the Trident UI product and keep
its layers glyph.

| File | Size | Use |
|---|---|---|
| `studio-glyph-white.svg`, `studio-glyph-ink.svg` | 340 x 510 vector | Verbatim approved Poseidon house glyph for dark and light surfaces |
| `tile.svg` | 512 vector | App icon, avatar, favicon source: rounded tile, teal to indigo at 135 degrees, 22% corners, the layers glyph at 62% |
| `tile-bleed.svg` | 512 vector | Full-bleed square for stores that round the corners themselves |
| `tile-maskable.svg` | 512 vector | Maskable PWA source, glyph inside the safe zone |
| `glyph-white.svg` | 512 vector | The white glyph alone |
| `icon-192.png`, `icon-512.png` | 192, 512 | Web app manifest icons |
| `icon-maskable-512.png` | 512 | Manifest icon with `purpose: "maskable"` |
| `apple-touch-icon.png` | 180 | iOS home screen, opaque |
| `app-icon-1024.png` | 1024 | iOS and macOS app icon catalog source, opaque square |
| `favicon.ico` | 16, 32 and 48 | Legacy favicon |
| `lockup-dark.svg`, `lockup-light.svg` | 640 x 160 vector | Tile plus "Trident UI" and the "By Trident Studio" credit with the text outlined, for dark and light surfaces: README headers, docs banners, decks. The art sits on the left of the canvas, so left-align it |
| `og-card.png` | 1200 x 630 | Link-preview (Open Graph and Twitter) card, opaque, under 1 MB |
| `og-card.svg` | 1200 x 630 vector | Vector source of the card |
| `trident-ui.tokens.json` | | The brand's own token file, verbatim; `test/brand.test.ts` pins the `trident-ui` themes to it |

Consumers read them as `@trident/ui/brand/tile.svg` (the `brand/*` export). `test/brand.test.ts`
pins every file's checksum and pixel size (the lockups and card included), so a changed or missing
file fails the gate until the change is deliberate. Never rotate, recolour or add text inside the tile; keep a quarter of the tile free on
every side; 16px is the smallest size.

No page in this repo carries `og:image`: the gallery is a test fixture and is not hosted. A product page
copies `og-card.png` and adds the six meta tags listed in [`docs/BRAND.md`](../docs/BRAND.md).

## Depth Line (superseded)

`depth-line.mjs`, `depth-line.css` and `depth-line-contours.svg` are the three-rail mark and
contour backdrop approved 2026-10-07. The tile replaces them as the Trident mark. They stay
byte-for-byte (apart from a note in each header) so nothing that imports them breaks; no repo in the
workspace imports them any more. Removing them is a major-version change.
