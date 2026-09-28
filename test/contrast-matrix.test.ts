/**
 * Spec §9 contrast matrix: every theme (and every data-portal-palette variant) x every required pair.
 * Pairs live in tokens.json "contrast.pairs". A failure here blocks the build — fix the token
 * (per spec: adjust accent-text) and record the change in docs/DEVIATIONS.md.
 */
import { describe, expect, it } from 'vitest'
import { HEX_RE, loadTokens, resolveTheme, themeVariants } from '../scripts/lib/tokens.mjs'
import { contrastRatio } from '../src/utils/contrast'

const tokens = loadTokens()
const variants = themeVariants(tokens)
const pairs: { fg: string; bg: string[]; min: number }[] = tokens.contrast.pairs

const REQUIRED_THEMES = [
  'trident-studio',
  'trident-nil',
  'trident-ops',
  'trident-playbook',
  'trident-tools',
  'trident-agents',
  'wmh-portal',
  'wmh-marketing',
  'wmh-dark',
  'portfolio',
  'quorum',
]

describe('theme inventory (spec §3)', () => {
  it('ships exactly the package themes, no client themes', () => {
    expect(Object.keys(tokens.themes).sort()).toEqual([...REQUIRED_THEMES].sort())
    for (const client of ['kula', 'corner-bar', 'filippa']) {
      expect(Object.keys(tokens.themes).some((t) => t.includes(client))).toBe(false)
    }
  })

  it('covers every pair family the spec requires', () => {
    const fgs = new Set(pairs.map((p) => p.fg))
    for (const fg of ['ink', 'muted', 'accent-text', 'on-accent', 'focus', 'line-strong']) expect(fgs.has(fg)).toBe(true)
  })
})

describe.each(variants)('contrast: $id', ({ theme, palette }) => {
  const roles = resolveTheme(tokens, theme, palette)
  const cases = pairs.flatMap((p) => p.bg.map((bg) => ({ fg: p.fg, bg, min: p.min })))

  it.each(cases)('$fg on $bg >= $min', ({ fg, bg, min }) => {
    const f = roles[fg]!
    const b = roles[bg]!
    expect(f, `${theme} ${fg} must be an opaque hex colour`).toMatch(HEX_RE)
    expect(b, `${theme} ${bg} must be an opaque hex colour`).toMatch(HEX_RE)
    const ratio = contrastRatio(f, b)
    expect(ratio, `${theme}${palette ? `[${palette}]` : ''}: ${fg} ${f} on ${bg} ${b} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
  })
})
