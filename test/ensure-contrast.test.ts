import { describe, expect, it } from 'vitest'
import {
  DARK_INK,
  LIGHT_INK,
  accentVars,
  adjustToContrast,
  contrastRatio,
  ensureContrast,
  parseHex,
  pickOnAccent,
  relativeLuminance,
} from '../src/utils/contrast'

describe('contrast math', () => {
  it('matches the WCAG reference points', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#fff', '#fff')).toBeCloseTo(1, 5)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 6)
    // #767676 on white is the canonical 4.54:1 AA grey.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('parses #rgb and #rrggbb and rejects everything else', () => {
    expect(parseHex('#abc')).toEqual([0xaa, 0xbb, 0xcc])
    expect(parseHex('7c3aed')).toEqual([0x7c, 0x3a, 0xed])
    expect(() => parseHex('rgb(0,0,0)')).toThrow(TypeError)
    expect(() => parseHex('#12345')).toThrow(TypeError)
  })
})

describe('ensureContrast (spec §2.3)', () => {
  it('Ops default tenant accent #6366f1 on the fleet bg', () => {
    const r = ensureContrast('#6366f1', '#070d16', { alsoOn: ['#0e1a2b'] })
    expect(r.ratios.accentTextOnBg).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(r.accentText, '#0e1a2b')).toBeGreaterThanOrEqual(4.5)
    expect(r.ratios.fillOnBg).toBeGreaterThanOrEqual(3)
    expect(r.ratios.onAccentOnFill).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps a passing accent unchanged', () => {
    const r = ensureContrast('#2dd4bf', '#070d16')
    expect(r.adjusted).toBe(false)
    expect(r.fill).toBe('#2dd4bf')
    expect(r.accentText).toBe('#2dd4bf')
    expect(r.onAccent).toBe(DARK_INK)
  })

  it('WMH violet on the marketing void lightens accent-text (spec: #7c3aed is ~3.3:1 there)', () => {
    const r = ensureContrast('#7c3aed', '#04040a')
    expect(contrastRatio('#7c3aed', '#04040a')).toBeLessThan(4.5)
    expect(r.accentText).not.toBe('#7c3aed')
    expect(r.ratios.accentTextOnBg).toBeGreaterThanOrEqual(4.5)
    expect(r.onAccent).toBe(LIGHT_INK)
  })

  it('darkens a light accent on a light surface and clamps a sub-3:1 fill', () => {
    const r = ensureContrast('#efa31d', '#ffffff') // saffron, ~2:1 on white
    expect(contrastRatio('#efa31d', '#ffffff')).toBeLessThan(3)
    expect(r.ratios.fillOnBg).toBeGreaterThanOrEqual(3)
    expect(r.ratios.accentTextOnBg).toBeGreaterThanOrEqual(4.5)
    expect(r.onAccent).toBe(DARK_INK)
  })

  it('picks whichever ink contrasts more', () => {
    expect(pickOnAccent('#fbbf24')).toBe(DARK_INK)
    expect(pickOnAccent('#5b21b6')).toBe(LIGHT_INK)
  })

  it('finds a passing shade for every hue on dark and light backgrounds', () => {
    for (let h = 0; h < 360; h += 15) {
      const hex = hsl(h, 70, 50)
      for (const bg of ['#070d16', '#04040a', '#ffffff', '#f7f9fd']) {
        const r = ensureContrast(hex, bg)
        expect(r.ratios.accentTextOnBg, `${hex} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        expect(r.ratios.fillOnBg, `${hex} on ${bg}`).toBeGreaterThanOrEqual(3)
        expect(r.ratios.onAccentOnFill, `${hex} on ${bg}`).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('adjustToContrast returns the smallest passing move', () => {
    const out = adjustToContrast('#7c3aed', '#04040a', 4.5)
    expect(contrastRatio(out, '#04040a')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(out, '#04040a')).toBeLessThan(4.7)
  })

  it('accentVars emits the four runtime custom properties', () => {
    expect(Object.keys(accentVars('#e34c4c', '#0d0a0a')).sort()).toEqual(
      ['--ui-accent-1', '--ui-accent-text', '--ui-focus', '--ui-on-accent'].sort(),
    )
  })
})

function hsl(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
