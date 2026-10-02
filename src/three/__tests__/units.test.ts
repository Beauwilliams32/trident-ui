/** Pure units of @trident/ui/three: tiers, probes, honesty, colours, frame guard. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildThreeColorTableJson,
  HEX_RE,
  loadTokens,
  resolveTheme,
  ROOT,
  THREE_COLOR_TABLE_FILE,
  themeVariants,
  threeColors,
  hexToInt as tokenHexToInt,
} from '../../../scripts/lib/tokens.mjs'
import { generatedColorsIfLoaded, hexToInt, intToRgb, loadGeneratedColors, parseCssColor } from '../colors'
import { computeQualityTier, forbiddenSurface, isFormField, lowPower, type QualityInputs } from '../env'
import { FpsGuard } from '../fpsGuard'
import { generatedColors, threeThemeNames } from '../generated'
import {
  cardState,
  FALLBACK_STATUS_ITEMS,
  MAX_POINTER_TILT,
  MAX_STATUS_CARDS,
  pointerTilt,
  ringScale,
  stateText,
  statusCards,
  type StatusOrbitItem,
} from '../statusCards'

const base: QualityInputs = { reducedMotion: false, paused: false, lowPower: false, width: 1280, coarsePointer: false, performanceDeclined: false }

describe('computeQualityTier', () => {
  it('is high on a capable wide desktop', () => {
    expect(computeQualityTier(base)).toBe('high')
  })
  it.each([
    ['reduced motion', { reducedMotion: true }],
    ['Pause motion', { paused: true }],
    ['lowPower', { lowPower: true }],
    ['a phone-width viewport', { width: 767 }],
  ])('is off under %s', (_label, over) => {
    expect(computeQualityTier({ ...base, ...over })).toBe('off')
  })
  it.each([
    ['the 768–979px band', { width: 900 }],
    ['a coarse pointer', { coarsePointer: true }],
    ['a PerformanceMonitor step-down', { performanceDeclined: true }],
  ])('is low for %s', (_label, over) => {
    expect(computeQualityTier({ ...base, ...over })).toBe('low')
  })
})

describe('lowPower (07-motion.js thresholds)', () => {
  it.each([
    [{ connection: { saveData: true } }, true],
    [{ connection: { effectiveType: '2g' } }, true],
    [{ connection: { effectiveType: 'slow-2g' } }, true],
    [{ connection: { effectiveType: '3g' } }, false],
    [{ deviceMemory: 2 }, true],
    [{ deviceMemory: 4 }, false],
    [{ hardwareConcurrency: 2 }, true],
    [{ hardwareConcurrency: 4 }, false],
    [{}, false],
  ])('%j -> %s', (nav, expected) => {
    expect(lowPower(nav)).toBe(expected)
  })
})

describe('isFormField', () => {
  const el = (html: string) => {
    const d = document.createElement('div')
    d.innerHTML = html
    return d.firstElementChild
  }
  it.each([
    ['<input>', true],
    ['<input type="email">', true],
    ['<input type="checkbox">', true],
    ['<textarea></textarea>', true],
    ['<select></select>', true],
    ['<div contenteditable="true"></div>', true],
    ['<div contenteditable=""></div>', true],
    ['<input type="submit">', false],
    ['<input type="button">', false],
    ['<button>Go</button>', false],
    ['<a href="#">x</a>', false],
    ['<div contenteditable="false"></div>', false],
  ])('%s -> %s', (html, expected) => {
    expect(isFormField(el(html))).toBe(expected)
  })
  it('handles null', () => expect(isFormField(null)).toBe(false))
})

describe('forbiddenSurface', () => {
  it('finds the nearest forbidden [data-surface] ancestor', () => {
    const root = document.createElement('div')
    root.innerHTML = '<main data-surface="auth"><div><span id="x"></span></div></main>'
    expect(forbiddenSurface(root.querySelector('#x'))).toBe('auth')
  })
  it('accepts pipe or space separated lists', () => {
    const d = document.createElement('div')
    d.setAttribute('data-surface', 'marketing|money')
    expect(forbiddenSurface(d)).toBe('money')
  })
  it('allows other surfaces', () => {
    const d = document.createElement('div')
    d.setAttribute('data-surface', 'marketing')
    expect(forbiddenSurface(d)).toBeNull()
    expect(forbiddenSurface(null)).toBeNull()
  })
})

describe('StatusOrbit honesty (spec §6.3 rule 9, §10.10)', () => {
  it('the fallback list never lights anything', () => {
    const cards = statusCards()
    expect(cards.length).toBe(MAX_STATUS_CARDS)
    expect(cards.some((c) => c.live)).toBe(false)
    expect(cards.some((c) => c.state === 'live')).toBe(false)
    expect(statusCards(null).some((c) => c.live)).toBe(false)
    expect(statusCards([]).some((c) => c.live)).toBe(false)
    expect(FALLBACK_STATUS_ITEMS.every((i) => i.live !== true)).toBe(true)
  })

  it('lights a platform only on live === true', () => {
    const items = [
      { id: 'instagram', label: 'Instagram', live: true },
      { id: 'tiktok', label: 'TikTok', live: 'true' },
      { id: 'youtube', label: 'YouTube', live: 1 },
      { id: 'facebook', label: 'Facebook' },
    ] as unknown as StatusOrbitItem[]
    const cards = statusCards(items)
    const lit = cards.filter((c) => c.live).map((c) => c.key)
    expect(lit).toEqual(['instagram'])
    expect(cards.find((c) => c.key === 'instagram')?.state).toBe('live')
  })

  it('never lights a workflow card, even with live: true', () => {
    const cards = statusCards([{ id: 'approved', label: 'Approved ✓', kind: 'workflow', live: true }])
    expect(cards.find((c) => c.key === 'approved')).toMatchObject({ live: false, state: 'workflow' })
  })

  it('caller items override fallback entries by id, dedupe, and cap at 10', () => {
    const items: StatusOrbitItem[] = [
      { id: 'linkedin', label: 'LinkedIn', live: true },
      { id: 'linkedin', label: 'LinkedIn again', live: false },
      ...Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, label: `P${i}` })),
    ]
    const cards = statusCards(items)
    expect(cards).toHaveLength(MAX_STATUS_CARDS)
    expect(cards[0]).toMatchObject({ key: 'linkedin', live: true })
    expect(new Set(cards.map((c) => c.key)).size).toBe(cards.length)
  })

  it('skips malformed items', () => {
    const cards = statusCards([null, { label: '' }, { id: 'x' }] as unknown as StatusOrbitItem[])
    expect(cards.every((c) => c.label.length > 0)).toBe(true)
  })

  it('pending reads as "In review"; every state has text (never colour alone)', () => {
    expect(cardState({ label: 'X', state: 'pending' })).toBe('pending')
    expect(stateText('live')).toBe('Publishing')
    expect(stateText('pending')).toBe('In review')
    expect(stateText('unknown')).toBe('Status not confirmed')
    expect(stateText('workflow')).toBe('Workflow step')
  })
})

describe('motion caps', () => {
  it('ringScale eases from 1 to 0.7 over 600px and clamps', () => {
    expect(ringScale(0)).toBe(1)
    expect(ringScale(600)).toBeCloseTo(0.7)
    expect(ringScale(5000)).toBeCloseTo(0.7)
    expect(ringScale(-100)).toBe(1)
    expect(ringScale(300)).toBeCloseTo(0.85)
  })
  it('pointer tilt never exceeds ±4°', () => {
    expect(MAX_POINTER_TILT).toBeCloseTo((4 * Math.PI) / 180)
    for (const f of [-5, 0, 0.25, 0.5, 1, 7, Number.NaN]) {
      expect(Math.abs(pointerTilt(f))).toBeLessThanOrEqual(MAX_POINTER_TILT + 1e-12)
    }
    expect(pointerTilt(0.5)).toBe(0)
  })
})

describe('generated three.js colours', () => {
  const tokens = loadTokens()
  const expected = threeColors(tokens) as Record<string, Record<string, number>>

  it('equal scripts/lib/tokens.mjs threeColors() (the @trident/ui/three.mjs source) for every theme', () => {
    expect([...threeThemeNames].sort()).toEqual(Object.keys(expected).sort())
    for (const name of threeThemeNames) expect({ ...generatedColors(name) }, name).toEqual(expected[name])
  })

  it('unknown themes fall back to trident-studio', () => {
    expect(generatedColors('nope')).toBe(generatedColors('trident-studio'))
    expect(generatedColors('constructor')).toBe(generatedColors('trident-studio'))
    expect(generatedColors('wmh-portal', 'toString')).toBe(generatedColors('wmh-portal'))
  })

  it('every theme and palette variant equals scripts/lib/tokens.mjs resolveTheme() as ints', () => {
    const variants = themeVariants(tokens)
    expect(variants.some((v) => v.palette)).toBe(true)
    for (const v of variants) {
      const ints: Record<string, number> = {}
      for (const [role, value] of Object.entries(resolveTheme(tokens, v.theme, v.palette))) if (HEX_RE.test(value)) ints[role] = tokenHexToInt(value)
      expect({ ...generatedColors(v.theme, v.palette) }, v.id).toEqual(ints)
    }
  })

  it('generated-colors.json is in sync with tokens.json (run `npm run build:tokens` after editing tokens.json)', () => {
    const committed = readFileSync(join(ROOT, THREE_COLOR_TABLE_FILE), 'utf8')
    expect(committed).toBe(buildThreeColorTableJson(tokens))
  })

  it('the lazy colour module carries the precomputed table, never tokens.json (3D budget, spec §6.6)', () => {
    const source = readFileSync(join(ROOT, 'src/three/generated.ts'), 'utf8')
    expect(source).not.toMatch(/from\s+['"][^'"]*tokens\.json['"]/)
    expect(source).toMatch(/from\s+'\.\/generated-colors\.json'/)
  })

  it('applies data-portal-palette variants when a theme has them', () => {
    const withPalettes = Object.entries(tokens.themes as Record<string, { palettes?: Record<string, unknown> }>).find(([, t]) => t.palettes && Object.keys(t.palettes).length)
    if (!withPalettes) return
    const [name, t] = withPalettes
    const palette = Object.keys(t.palettes as object)[0] as string
    expect(generatedColors(name, palette)).toBeTypeOf('object')
    expect(generatedColors(name, 'missing')).toBe(generatedColors(name))
  })

  it('loads lazily for the light entry', async () => {
    await loadGeneratedColors()
    expect(generatedColorsIfLoaded('wmh-portal')?.['accent-1']).toBe(expected['wmh-portal']?.['accent-1'])
  })

  it('parses computed CSS colours and rejects the rest', () => {
    expect(parseCssColor('#7c3aed')).toBe(0x7c3aed)
    expect(parseCssColor(' #fff ')).toBe(0xffffff)
    expect(parseCssColor('rgb(124, 58, 237)')).toBe(0x7c3aed)
    expect(parseCssColor('rgba(124 58 237 / 0.5)')).toBe(0x7c3aed)
    expect(parseCssColor('color-mix(in srgb, #fff 50%, transparent)')).toBeNull()
    expect(parseCssColor('')).toBeNull()
    expect(parseCssColor(undefined)).toBeNull()
    expect(hexToInt('#abc')).toBe(0xaabbcc)
    expect(intToRgb(0xff0000)).toEqual([1, 0, 0])
  })
})

describe('FpsGuard (poster below 40fps for 3s)', () => {
  afterEach(() => vi.restoreAllMocks())
  const feed = (g: FpsGuard, fps: number, seconds: number) => {
    let tripped = false
    for (let i = 0; i < Math.round(fps * seconds); i++) tripped = g.push(1 / fps)
    return tripped
  }
  it('trips after 3s under 40fps', () => {
    const g = new FpsGuard()
    expect(feed(g, 30, 2.4)).toBe(false)
    expect(feed(g, 30, 0.8)).toBe(true)
    expect(g.tripped).toBe(true)
  })
  it('does not trip at 60fps or at 45fps', () => {
    expect(feed(new FpsGuard(), 60, 10)).toBe(false)
    expect(feed(new FpsGuard(), 45, 10)).toBe(false)
  })
  it('a recovery resets the window', () => {
    const g = new FpsGuard()
    feed(g, 30, 2.5)
    feed(g, 60, 1)
    expect(feed(g, 30, 2.5)).toBe(false)
  })
  it('a long gap (tab switch, demand loop) resets instead of counting as slowness', () => {
    const g = new FpsGuard()
    feed(g, 30, 2.5)
    expect(g.push(5)).toBe(false)
    expect(feed(g, 30, 2.5)).toBe(false)
  })
})
