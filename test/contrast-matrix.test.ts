/**
 * Spec §9 contrast matrix: every theme (and every data-portal-palette variant) x every required pair.
 * Pairs live in tokens.json "contrast.pairs". A failure here blocks the build — fix the token
 * (per spec: adjust accent-text) and record the change in docs/DEVIATIONS.md.
 */
import { describe, expect, it } from 'vitest'
import { buildThemeCss, buildTokensCss, HEX_RE, highContrastRoles, loadTokens, resolveHighContrast, resolveTheme, themeVariants } from '../scripts/lib/tokens.mjs'
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

/**
 * Increase Contrast (G15; Apple HIG "Increase Contrast", Radix highContrast). Every theme emits a
 * @media (prefers-contrast: more) block whose ink and muted reach 7:1 and whose line-strong reaches
 * 4.5:1 on bg, bg-2 and surface; hairlines become the old strong line (3:1) and glass turns solid.
 */
const hcPairs: { fg: string; bg: string[]; min: number }[] = tokens['high-contrast'].pairs

describe('high-contrast pair floors', () => {
  it('are ink and muted >= 7:1, line-strong >= 4.5:1', () => {
    const min = (fg: string) => hcPairs.find((p) => p.fg === fg)?.min
    expect(min('ink')).toBeGreaterThanOrEqual(7)
    expect(min('muted')).toBeGreaterThanOrEqual(7)
    expect(min('line-strong')).toBeGreaterThanOrEqual(4.5)
  })
})

describe.each(Object.keys(tokens.themes))('high contrast: %s', (theme) => {
  const roles = resolveHighContrast(tokens, theme)
  const base = resolveTheme(tokens, theme)
  const cases = hcPairs.flatMap((p) => p.bg.map((bg) => ({ fg: p.fg, bg, min: p.min })))

  it.each(cases)('$fg on $bg >= $min', ({ fg, bg, min }) => {
    const ratio = contrastRatio(roles[fg]!, roles[bg]!)
    expect(ratio, `${theme} (prefers-contrast: more): ${fg} ${roles[fg]} on ${bg} ${roles[bg]} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
  })

  it('never lowers a role and keeps the hierarchy ink >= ink-2 >= muted', () => {
    for (const fg of ['ink', 'ink-2', 'muted', 'line-strong'])
      expect(contrastRatio(roles[fg]!, roles.bg!)).toBeGreaterThanOrEqual(contrastRatio(base[fg]!, base.bg!) - 0.001)
    expect(contrastRatio(roles.ink!, roles.bg!)).toBeGreaterThanOrEqual(contrastRatio(roles['ink-2']!, roles.bg!))
    expect(contrastRatio(roles['ink-2']!, roles.bg!)).toBeGreaterThanOrEqual(contrastRatio(roles.muted!, roles.bg!))
  })

  it('is emitted in the theme stylesheet under @media (prefers-contrast: more)', () => {
    const css = buildThemeCss(tokens, theme)
    const block = css.slice(css.indexOf('@media (prefers-contrast: more)'))
    expect(block).toContain(`[data-theme="${theme}"]`)
    for (const [role, value] of Object.entries(highContrastRoles(tokens, theme))) expect(block).toContain(`--ui-${role}: ${value};`)
    for (const role of ['line', 'glass-edge', 'glass', 'glass-strong']) expect(block).toContain(`--ui-${role}:`)
  })
})

describe('tokens.css', () => {
  it('carries the default theme high-contrast block', () => {
    expect(buildTokensCss(tokens)).toMatch(/@media \(prefers-contrast: more\) \{\n {2}:root \{/)
  })
})
