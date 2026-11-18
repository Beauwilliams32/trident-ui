/**
 * Brand (G13): the Trident UI product tile and approved Trident Studio house glyph at the sizes used,
 * the "Trident UI by Trident Studio" lockup (tile plus live text), the supplied outlined lockups and
 * 1200 x 630 link-preview card, the icon files with their pixel sizes, and the legacy Depth Line
 * contour backdrop. The artwork is the supplied Illustrator export (brand/*.svg, brand/*.png);
 * nothing here redraws it. docs/BRAND.md has the rules. Shown for the
 * owner's creative review; the brand ships in a release only after that review.
 */
import '../../brand/depth-line.css'
import appIcon1024 from '../../brand/app-icon-1024.png'
import appleTouchIcon from '../../brand/apple-touch-icon.png'
import glyphWhite from '../../brand/glyph-white.svg'
import icon192 from '../../brand/icon-192.png'
import icon512 from '../../brand/icon-512.png'
import iconMaskable512 from '../../brand/icon-maskable-512.png'
import lockupDark from '../../brand/lockup-dark.svg'
import lockupLight from '../../brand/lockup-light.svg'
import ogCard from '../../brand/og-card.png'
import tile from '../../brand/tile.svg'
import tileBleed from '../../brand/tile-bleed.svg'
import tileMaskable from '../../brand/tile-maskable.svg'
import { Button } from '../../src/actions/Button'
import { BrandLockup } from '../../src/marketing'
import { Heading } from '../../src/type/Heading'
import { Kicker } from '../../src/type/Kicker'
import { Text } from '../../src/type/Text'
import type { RawExample } from '../registry'

export const TILE_SIZES = [16, 24, 32, 48, 64, 128] as const

/** Every file in brand/ that a product copies, with the pixel size it is drawn at and where it goes. */
export const ICON_FILES: Array<{ file: string; src: string; size: string; use: string; onDark?: boolean }> = [
  { file: 'tile.svg', src: tile, size: '512 x 512 vector', use: 'App icon, avatar and favicon source: the rounded tile on a transparent square' },
  { file: 'tile-bleed.svg', src: tileBleed, size: '512 x 512 vector', use: 'Full-bleed square for stores that round the corners themselves' },
  { file: 'tile-maskable.svg', src: tileMaskable, size: '512 x 512 vector', use: 'Maskable PWA source: the glyph sits inside the safe zone' },
  { file: 'glyph-white.svg', src: glyphWhite, size: '512 x 512 vector', use: 'The white layers glyph alone, for a fill you already own', onDark: true },
  { file: 'icon-192.png', src: icon192, size: '192 x 192', use: 'Web app manifest icon' },
  { file: 'icon-512.png', src: icon512, size: '512 x 512', use: 'Web app manifest icon and store listings' },
  { file: 'icon-maskable-512.png', src: iconMaskable512, size: '512 x 512', use: 'Web app manifest icon with purpose "maskable"' },
  { file: 'apple-touch-icon.png', src: appleTouchIcon, size: '180 x 180', use: 'iOS home screen (apple-touch-icon), opaque' },
  { file: 'app-icon-1024.png', src: appIcon1024, size: '1024 x 1024', use: 'iOS and macOS app icon catalog source, opaque square' },
]

/** The supplied lockups and link-preview card in brand/, with where each one is used. */
export const LOCKUP_FILES: Array<{ file: string; src: string; alt: string; size: string; use: string; stage: 'dark' | 'light' | 'card' }> = [
  { file: 'lockup-dark.svg', src: lockupDark, alt: 'Trident UI, by Trident Studio (dark surface lockup)', size: '640 x 160 vector', use: 'For dark surfaces: README headers, docs banners, decks', stage: 'dark' },
  { file: 'lockup-light.svg', src: lockupLight, alt: 'Trident UI, by Trident Studio (light surface lockup)', size: '640 x 160 vector', use: 'For light surfaces: the same lockup with dark ink', stage: 'light' },
  { file: 'og-card.png', src: ogCard, alt: 'Link-preview card: the Trident UI tile, "Trident UI", "One system, every screen." and "A Trident Studio product"', size: '1200 x 630', use: 'Link-preview (Open Graph and Twitter) card. og-card.svg is its vector source', stage: 'card' },
]

export const examples: RawExample[] = [
  {
    id: 'tile',
    title: 'The tile at every size',
    description: 'The product tile from brand/tile.svg at the sizes it is used, from the 16px favicon to the 128px profile image. Teal to indigo at 135 degrees, 22% corners, nothing inside but the glyph. Check the 16px tile: the three layers must stay apart.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-api__scroll" role="region" aria-label="Trident UI tile sizes" tabIndex={0}>
        <table className="g-api__table g-marks g-tiles">
          <thead>
            <tr>
              <th scope="col">Use</th>
              {TILE_SIZES.map((s) => (
                <th scope="col" key={s}>
                  {s}px
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Tile</th>
              {TILE_SIZES.map((s) => (
                <td key={s}>
                  <span className="g-mark" style={{ inlineSize: s, blockSize: s }}>
                    <img src={tile} alt={s === 64 ? 'Trident UI tile' : ''} width={s} height={s} />
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'lockup',
    title: 'Lockup: tile, product name, studio credit',
    description: 'The tile beside the product name in the display face, with the studio credit as a kicker. The name and the credit stay live text; never put words inside the tile.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-lockup">
        <span className="g-mark" style={{ inlineSize: 56, blockSize: 56 }}>
          <img src={tile} alt="" width={56} height={56} />
        </span>
        <div className="g-lockup__text">
          <Heading level={4} size="3xl">
            Trident UI
          </Heading>
          <Kicker>By Trident Studio</Kicker>
        </div>
      </div>
    ),
  },
  {
    id: 'lockup-files',
    title: 'Supplied lockups and link-preview card',
    description: 'The outlined lockups for dark and light surfaces and the 1200 x 630 link-preview card, copied from brand/. Use the lockups where the name cannot be live text (README headers, decks, banners); in the UI the name stays live text beside the tile, as above.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-brand-art">
        {LOCKUP_FILES.map((f) => (
          <figure key={f.file} data-brand-file={f.file} className={f.stage === 'card' ? 'g-brand-art__item g-brand-art__item--card' : 'g-brand-art__item'}>
            <div className={`g-brand-art__stage g-brand-art__stage--${f.stage}`}>
              {f.stage === 'card' ? <img src={f.src} alt={f.alt} width={600} height={315} /> : <img src={f.src} alt={f.alt} width={320} height={80} />}
            </div>
            <figcaption>
              <code>{f.file}</code>, {f.size}. {f.use}.
            </figcaption>
          </figure>
        ))}
      </div>
    ),
  },
  {
    id: 'studio-house-mark',
    title: 'Trident Studio house mark',
    description: 'The shared Poseidon-approved bold glyph in its unmodified ink and white source files. Product tiles and names stay product-specific; this lockup keeps the studio credit as live text.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-brand-art">
        <figure className="g-brand-art__item">
          <div className="g-brand-art__stage g-brand-art__stage--light">
            <div className="g-house-lockup">
              <BrandLockup name="Trident UI" kicker="Trident Studio" size={48} />
            </div>
          </div>
          <figcaption>Ink house glyph with live product name and studio credit.</figcaption>
        </figure>
        <figure className="g-brand-art__item">
          <div className="g-brand-art__stage g-brand-art__stage--dark">
            <div className="g-house-lockup">
              <BrandLockup name="Trident UI" kicker="Trident Studio" tone="white" size={48} />
            </div>
          </div>
          <figcaption>White house glyph on a dark surface, from the supplied white source.</figcaption>
        </figure>
      </div>
    ),
  },
  {
    id: 'files',
    title: 'Icon files',
    description: 'Every icon file a product copies from brand/, with the size it is drawn at and where it goes. favicon.ico holds 16, 32 and 48 pixel images and has no preview here.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="g-api__scroll" role="region" aria-label="Brand icon files" tabIndex={0}>
        <table className="g-api__table g-marks g-files">
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Size</th>
              <th scope="col">Preview</th>
              <th scope="col">Use</th>
            </tr>
          </thead>
          <tbody>
            {ICON_FILES.map((f) => (
              <tr key={f.file} data-icon-file={f.file}>
                <th scope="row">
                  <code>{f.file}</code>
                </th>
                <td>{f.size}</td>
                <td>
                  <span className={f.onDark ? 'g-mark g-glyph-chip' : 'g-mark'} style={{ inlineSize: 48, blockSize: 48 }}>
                    <img src={f.src} alt="" width={48} height={48} />
                  </span>
                </td>
                <td>{f.use}</td>
              </tr>
            ))}
            <tr data-icon-file="favicon.ico">
              <th scope="row">
                <code>favicon.ico</code>
              </th>
              <td>16, 32 and 48 px</td>
              <td>Browser tab</td>
              <td>Legacy favicon for browsers that do not read the SVG</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'contour-hero',
    title: 'Legacy: Depth Line contour backdrop on a hero mock',
    description: 'The decorative contour (brand/depth-line.css) from the superseded Depth Line direction, kept so existing imports keep resolving. Public marketing pages only; never on auth, money, legal or admin.',
    wide: true,
    showCode: false,
    render: () => (
      <div className="trident-depth-line g-brand-hero">
        <div className="g-brand-hero__copy">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="g-mark" style={{ inlineSize: 28, blockSize: 28 }}>
              <img src={tile} alt="" width={28} height={28} />
            </span>
            <Kicker>Trident Studio</Kicker>
          </div>
          <Heading level={4} size="3xl">
            Sample hero heading over the contour
          </Heading>
          <Text tone="ink-2">The contour carries no information. Text and controls stay legible without it.</Text>
          <div>
            <Button>Sample action</Button>
          </div>
        </div>
      </div>
    ),
  },
]
