/**
 * Contrast for the tone model (spec §7 "contrast-tested", §9). jsdom cannot compute CSS colours, so
 * this reproduces the styles.css formula in TypeScript and checks it in every theme and palette.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadTokens, resolveTheme, themeVariants } from '../../scripts/lib/tokens.mjs'
import { AA_NON_TEXT, AA_TEXT, contrastRatio, mix } from '../utils/contrast'
import { STATUS_MAP } from './StatusPill'
import { TONES, TONE_INK_PCT, TONE_ROLE, TONE_TINT_PCT, normalizeTone } from './tone'

const tokens = loadTokens()
const variants = themeVariants(tokens)
const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')

/** color-mix(in srgb, role P%, base) === mix(base, role, P/100). */
function toneFill(roles: Record<string, string>, role: string) {
  return mix(roles.surface!, roles[role]!, TONE_TINT_PCT / 100)
}
function toneInk(roles: Record<string, string>, role: string) {
  return mix(roles[role]!, roles.ink!, TONE_INK_PCT / 100)
}

const ROLES = [...new Set([...TONES.map((t) => TONE_ROLE[t]), 'status-reasoning'])]

describe('tone constants mirror styles.css', () => {
  it('fill and ink percentages match', () => {
    expect(css).toContain(`color-mix(in srgb, var(--ui-tone) ${TONE_TINT_PCT}%, var(--ui-surface))`)
    expect(css).toContain(`color-mix(in srgb, var(--ui-tone) ${100 - TONE_INK_PCT}%, var(--ui-ink))`)
  })

  it('every tone and StatusPill tone has a CSS rule', () => {
    for (const t of TONES) expect(css).toContain(`.ui-tone[data-tone='${t}']`)
    for (const def of Object.values(STATUS_MAP)) expect(css).toContain(`.ui-tone[data-tone='${def.tone}']`)
  })

  it('normalizes portal and feedback aliases', () => {
    expect(normalizeTone('violet')).toBe('accent')
    expect(normalizeTone('blue')).toBe('info')
    expect(normalizeTone('gold')).toBe('warn')
    expect(normalizeTone('success')).toBe('ok')
    expect(normalizeTone('warning')).toBe('warn')
    expect(normalizeTone('error')).toBe('danger')
    expect(normalizeTone('nope')).toBe('neutral')
    expect(normalizeTone(undefined, 'info')).toBe('info')
  })
})

describe.each(variants)('tone contrast: $id', ({ theme, palette }) => {
  const roles = resolveTheme(tokens, theme, palette) as Record<string, string>

  it.each(ROLES)('%s text on its tint >= 4.5:1', (role) => {
    const ratio = contrastRatio(toneInk(roles, role), toneFill(roles, role))
    expect(ratio, `${theme}${palette ? `[${palette}]` : ''} ${role}: ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('status dot (non-text) on its tint >= 3:1 where the dot is the tone colour', () => {
    for (const role of ROLES.filter((r) => r !== 'ink-2')) {
      // The dot is decorative (the pill always has text), so this is a quality floor, not a WCAG gate.
      expect(contrastRatio(roles[role]!, toneFill(roles, role))).toBeGreaterThanOrEqual(AA_NON_TEXT)
    }
  })

  it('Avatar initials: on-accent on accent-1 >= 4.5:1', () => {
    expect(contrastRatio(roles['on-accent']!, roles['accent-1']!)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('Chip neutral: ink on surface >= 4.5:1 and line-strong edge >= 3:1', () => {
    expect(contrastRatio(roles.ink!, roles.surface!)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(roles['line-strong']!, roles.surface!)).toBeGreaterThanOrEqual(AA_NON_TEXT)
  })

  it('StatCard: muted label and ink value on surface >= 4.5:1', () => {
    expect(contrastRatio(roles.muted!, roles.surface!)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(roles.ink!, roles.surface!)).toBeGreaterThanOrEqual(AA_TEXT)
  })
})
