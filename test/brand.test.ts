/**
 * Trident Studio brand system (docs/BRAND.md, approved 2026-10-20). Fails when the supplied tile
 * files, or the trident-ui / trident-ui-light themes built from the brand tokens, drift: files are
 * pinned by checksum and pixel size, and the themes by value against brand/trident-ui.tokens.json
 * (the brand's own token file, copied verbatim).
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bezier, buildThemeCss, loadTokens, mixHex, resolveTheme, ROOT, themeExtra } from '../scripts/lib/tokens.mjs'
import { contrastRatio } from '../src/utils/contrast'

const tokens = loadTokens()
const brand = JSON.parse(readFileSync(join(ROOT, 'brand/trident-ui.tokens.json'), 'utf8'))
const file = (name: string) => readFileSync(join(ROOT, 'brand', name))
const sha = (buf: Buffer) => createHash('sha256').update(buf).digest('hex')
const lower = (v: string) => v.toLowerCase()

/** The artwork as supplied (build/brand-systems/ui/assets), by checksum; update both together. */
const ASSETS: Array<{ name: string; sha256: string; png?: { size: number; colorType: 2 | 6 } }> = [
  { name: 'tile.svg', sha256: '21df51602144a7fde6cdacf9f2a0853e972a2a5a5ac169171c5bd86ede30c9d0' },
  { name: 'tile-bleed.svg', sha256: 'f951b3dc3e1321bab2e3d5a0e0996203e5b685f610745be288dd0a1a709b4639' },
  { name: 'tile-maskable.svg', sha256: 'ab14f5519134e20d817ea156e16b9b77b692444d1980b3a10643d727780fefcb' },
  { name: 'glyph-white.svg', sha256: '23091ff5697f40ef7212c8b4eb4af7ae4fa4cae3cc44f55f5a7efd7eb5083cf3' },
  { name: 'icon-192.png', sha256: 'd0a9f198c1b345c54d9fac3e2e83dcafcae8cab87e2cc21fd43651d6d542c5f9', png: { size: 192, colorType: 6 } },
  { name: 'icon-512.png', sha256: 'ddcdb9e30be0401214540a8a3a21637cf21a8345773165b20a2977e4962148bd', png: { size: 512, colorType: 6 } },
  { name: 'icon-maskable-512.png', sha256: '75de2ed29b7e290b2ee9ea0af0472d0faa881e556b744fcd84d744288740bbbe', png: { size: 512, colorType: 2 } },
  { name: 'apple-touch-icon.png', sha256: 'ac310093fbce899ff7340347d013f7098601f2b7c7da846a7de3bc2ca23f5fb7', png: { size: 180, colorType: 2 } },
  { name: 'app-icon-1024.png', sha256: '1be0c8902ca1172bf0eec5879f5693ed3e8e075f06d928d9300b2aa27190168d', png: { size: 1024, colorType: 2 } },
  { name: 'favicon.ico', sha256: '16f96a50c025bfce33c501c0f9c040c8115faf3c7557d6a9f523eaf84ea74011' },
]

describe('brand tile files', () => {
  it.each(ASSETS)('$name is the supplied artwork', ({ name, sha256 }) => {
    expect(existsSync(join(ROOT, 'brand', name))).toBe(true)
    expect(sha(file(name))).toBe(sha256)
  })

  it.each(ASSETS.filter((a) => a.png))('$name is a $png.size px PNG (colour type $png.colorType)', ({ name, png }) => {
    const buf = file(name)
    expect(buf.subarray(1, 4).toString('latin1')).toBe('PNG')
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([png!.size, png!.size])
    // 2 = RGB (opaque, required for the iOS and maskable icons), 6 = RGBA.
    expect(buf[25]).toBe(png!.colorType)
  })

  it('favicon.ico holds 16, 32 and 48 px images', () => {
    const buf = file('favicon.ico')
    expect([buf.readUInt16LE(0), buf.readUInt16LE(2)]).toEqual([0, 1])
    const sizes = Array.from({ length: buf.readUInt16LE(4) }, (_, i) => buf[6 + i * 16]!)
    expect(sizes).toEqual([16, 32, 48])
  })

  it('tile.svg is the teal to indigo tile: 512 viewBox, 22% corners, three white layers', () => {
    const svg = file('tile.svg').toString('utf8')
    expect(svg).toContain('viewBox="0 0 512 512"')
    expect(svg.toLowerCase()).toContain(`stop-color:${brand.color.tile[0].toLowerCase()}`)
    expect(svg.toLowerCase()).toContain(`stop-color:${brand.color.tile[1].toLowerCase()}`)
    // 22% of 512 = 112.64: the rounded-corner radius in the tile path.
    expect(svg).toContain('112.64')
    expect(svg.match(/<polygon fill="#FFFFFF"/g)).toHaveLength(3)
  })

  it('glyph-white.svg is the same three white layers and nothing else', () => {
    const svg = file('glyph-white.svg').toString('utf8')
    expect(svg.match(/<polygon fill="#FFFFFF"/g)).toHaveLength(3)
    expect(svg).not.toContain('linearGradient')
  })

  it('ships in the package: brand/ is in files and exported as brand/*', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    expect(pkg.files).toContain('brand')
    expect(pkg.exports['./brand/*']).toBe('./brand/*')
  })
})

describe('brand tokens in the trident-ui themes', () => {
  const dark = resolveTheme(tokens, 'trident-ui')
  const light = resolveTheme(tokens, 'trident-ui-light')

  it('ships exactly one dark and one light studio theme', () => {
    const studio = Object.entries<{ family?: string; scheme?: string }>(tokens.themes).filter(([, t]) => t.family === 'studio')
    expect(studio.map(([n, t]) => [n, t.scheme])).toEqual([
      ['trident-ui', 'dark'],
      ['trident-ui-light', 'light'],
    ])
  })

  it.each([
    ['bg', 'bg'],
    ['surface', 'surface'],
    ['line', 'line'],
    ['text', 'ink'],
    ['muted', 'muted'],
    ['link', 'accent-text'],
  ])('dark brand %s is --ui-%s', (brandKey, role) => {
    expect(dark[role]).toBe(lower(brand.color.dark[brandKey]))
  })

  it.each([
    ['bg', 'bg'],
    ['surface', 'surface'],
    ['line', 'line'],
    ['text', 'ink'],
    ['muted', 'muted'],
    ['link', 'accent-text'],
  ])('light brand %s is --ui-%s', (brandKey, role) => {
    expect(light[role]).toBe(lower(brand.color.light[brandKey]))
  })

  it('both themes carry the accent pair, on-accent and the 135 degree tile gradient', () => {
    for (const r of [dark, light]) {
      expect([r['accent-1'], r['accent-2'], r['on-accent']]).toEqual([lower(brand.color.accent), lower(brand.color.accent2), lower(brand.color['on-accent'])])
      expect(r['accent-grad']).toBe(`linear-gradient(${brand.tile['gradient-angle']}deg, ${lower(brand.color.tile[0])}, ${lower(brand.color.tile[1])})`)
      expect(r.focus).toBe(r['accent-text'])
    }
  })

  it('dark signals are the brand signals; light signals are those signals darkened to pass 4.5:1', () => {
    for (const [name, role] of [['success', 'ok'], ['warning', 'warn'], ['danger', 'danger'], ['info', 'info']] as const) {
      const signal = lower(brand.color.signal[name])
      expect(dark[role]).toBe(signal)
      const darkened = Array.from({ length: 13 }, (_, i) => mixHex(signal, '#000000', i / 20))
      expect(darkened, `light ${role} is the brand ${name} mixed toward black`).toContain(light[role])
    }
  })

  it('the accent ramps are the brand scales', () => {
    const p = tokens.primitives.color
    for (const [step, value] of Object.entries<string>(brand.color['accent-scale'])) expect(p['studio-teal'][step]).toBe(lower(value))
    for (const [step, value] of Object.entries<string>(brand.color['accent2-scale'])) expect(p['studio-indigo'][step]).toBe(lower(value))
  })

  it('type: Playfair Display, Inter and JetBrains Mono, with the brand scale', () => {
    const family = (stack: string) => stack.match(/^'([^']+)'/)![1]
    for (const r of [dark, light]) {
      expect(family(r['font-display']!)).toBe(family(brand.type.display))
      expect(family(r['font-body']!)).toBe(family(brand.type.text))
      expect(family(r['font-mono']!)).toBe(family(brand.type.mono))
    }
    const x = themeExtra(tokens, 'trident-ui')
    // The last length in each clamp() is its largest size: the brand's px value.
    const max = (v = '') => Number(v.match(/(\d+)px\)$/)?.[1] ?? v.match(/^(\d+)px$/)?.[1])
    expect(max(x['text-display'])).toBe(brand.type.scale.display)
    expect(max(x['text-4xl'])).toBe(brand.type.scale.heading)
    expect(max(tokens.primitives['font-size'].xl)).toBe(brand.type.scale.subhead)
    expect(max(x['text-base'])).toBe(brand.type.scale.body)
    expect(max(tokens.primitives['font-size'].xs)).toBe(brand.type.scale.caption)
    expect(x['weight-display']).toBe('700')
  })

  it('space, radius and motion map onto the existing --ui-* names', () => {
    const space = Object.values<string>(tokens.primitives.space).map((v) => parseInt(v))
    for (const n of brand.space) expect(space, `--ui-space for ${n}px`).toContain(n)
    for (const r of [dark, light]) {
      expect([r['r-xs'], r['r-sm'], r.r, r['r-lg'], r['r-pill']]).toEqual(
        [brand.radius.sm, brand.radius.md, brand.radius.lg, brand.radius.xl, brand.radius.pill].map((n) => `${n}px`),
      )
    }
    const x = themeExtra(tokens, 'trident-ui-light')
    expect(`${tokens.motion.duration.fast}ms`).toBe(brand.motion.fast)
    expect(x.dur).toBe(brand.motion.base)
    expect(`${tokens.motion.duration.med}ms`).toBe(brand.motion.slow)
    expect(bezier(tokens.motion.easing.ease)).toBe(brand.motion.easing.replace(/\s/g, ''))
    expect([x['shadow-raised'], x['shadow-overlay']]).toEqual([brand.shadow.raised, brand.shadow.overlay])
  })

  it('built CSS defines the accent token, the tile gradient and the brand type under data-theme', () => {
    const css = buildThemeCss(tokens, 'trident-ui')
    expect(css).toContain('[data-theme="trident-ui"] {')
    expect(css).toContain('--ui-accent-1: #19c3b1;')
    expect(css).toContain('--ui-accent-2: #5b6cff;')
    expect(css).toContain('--ui-accent-grad: linear-gradient(135deg, var(--ui-accent-1), var(--ui-accent-2));')
    expect(css).toContain("--ui-font-display: 'Playfair Display'")
    expect(css).toContain('--ui-dur: 240ms;')
    expect(buildThemeCss(tokens, 'trident-ui-light')).toContain('--ui-accent-text: #0f756a;')
  })
})

describe('brand accessibility (text 4.5:1, large text and UI borders 3:1)', () => {
  const pairs = (theme: string) => {
    const r = resolveTheme(tokens, theme)
    const bgs = ['bg', 'bg-2', 'surface'] as const
    return { r, bgs }
  }

  it.each(['trident-ui', 'trident-ui-light'])('%s: every text role reaches 4.5:1 on bg, bg-2 and surface', (theme) => {
    const { r, bgs } = pairs(theme)
    for (const fg of ['ink', 'ink-2', 'muted', 'accent-text', 'ok', 'warn', 'danger', 'info', 'status-reasoning'])
      for (const bg of bgs) expect(contrastRatio(r[fg]!, r[bg]!), `${theme}: ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(['trident-ui', 'trident-ui-light'])('%s: focus and control borders reach 3:1; on-accent reaches 4.5:1 on both ends of the gradient', (theme) => {
    const { r, bgs } = pairs(theme)
    for (const bg of bgs) {
      expect(contrastRatio(r.focus!, r[bg]!), `${theme}: focus on ${bg}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(r['line-strong']!, r[bg]!), `${theme}: line-strong on ${bg}`).toBeGreaterThanOrEqual(3)
    }
    expect(contrastRatio(r['on-accent']!, r['accent-1']!)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(r['on-accent']!, r['accent-2']!)).toBeGreaterThanOrEqual(4.5)
  })

  it('the contrast the brand book prints for its own pairs holds (link on light 4.9:1)', () => {
    expect(contrastRatio(lower(brand.color.light.link), lower(brand.color.light.bg))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(lower(brand.color.dark.link), lower(brand.color.dark.bg))).toBeGreaterThanOrEqual(4.5)
  })
})

describe('brand docs', () => {
  it('docs/BRAND.md and the README name both studio themes and the tile files', () => {
    const doc = readFileSync(join(ROOT, 'docs/BRAND.md'), 'utf8')
    const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
    for (const theme of ['trident-ui', 'trident-ui-light']) {
      expect(doc).toContain(`\`${theme}\``)
      expect(readme).toContain(`\`${theme}\``)
    }
    for (const { name } of ASSETS) expect(doc, name).toContain(name)
  })
})
