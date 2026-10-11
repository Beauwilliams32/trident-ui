/**
 * Visual token documentation (G8; Radix Themes' colour / radius / shadow pages, shadcn's
 * "every fill has a foreground"). Everything is read from tokens.json at build time: resolved role
 * values per theme, the contrast pair each colour role takes part in with its measured ratio, the
 * Increase Contrast overrides, and the theme-independent scales.
 */
import { contrast, highContrastRoles, loadTokens, resolveTheme, themeScheme } from '../../scripts/lib/tokens.mjs'

export interface PairCheck {
  fg: string
  bg: string
  ratio: number
  min: number
}

export interface RoleDoc {
  role: string
  value: string
  kind: 'color' | 'font' | 'radius' | 'size'
  /** Contrast checks this role takes part in, as text or as the background. */
  pairs: PairCheck[]
  /** Its value under Increase Contrast, when that changes it. */
  highContrast?: string
}

export interface ThemeDoc {
  name: string
  scheme: 'dark' | 'light'
  roles: RoleDoc[]
}

export interface TokenDocs {
  roles: string[]
  themes: Record<string, ThemeDoc>
  space: Record<string, string>
  radius: Record<string, string>
  fontSize: Record<string, string>
  durations: Record<string, number>
  easings: Record<string, number[]>
  springs: Record<string, Record<string, number>>
  elevation: Record<string, Record<string, string>>
  component: Record<string, string>
}

const HEX = /^#[0-9a-f]{6}$/i
const kindOf = (role: string, value: string): RoleDoc['kind'] =>
  role.startsWith('font-') ? 'font' : /^r(-|$)/.test(role) ? 'radius' : /^(blur)/.test(role) ? 'size' : /px$/.test(value) && !value.includes('(') ? 'size' : 'color'

export function tokenDocs(): TokenDocs {
  const tokens = loadTokens()
  const pairs: { fg: string; bg: string[]; min: number }[] = tokens.contrast.pairs
  const themeNames = ['fleet', ...Object.keys(tokens.themes)]
  const themes: Record<string, ThemeDoc> = {}
  for (const name of themeNames) {
    const source = name === 'fleet' ? 'trident-studio' : name
    const resolved = resolveTheme(tokens, source)
    const hc = highContrastRoles(tokens, source)
    const roles: RoleDoc[] = tokens.roles.map((role: string) => {
      const value = resolved[role]!
      const checks: PairCheck[] = []
      for (const p of pairs)
        for (const bg of p.bg)
          if ((p.fg === role || bg === role) && HEX.test(resolved[p.fg] ?? '') && HEX.test(resolved[bg] ?? ''))
            checks.push({ fg: p.fg, bg, ratio: Math.round(contrast(resolved[p.fg]!, resolved[bg]!) * 100) / 100, min: p.min })
      return { role, value, kind: kindOf(role, value), pairs: checks, ...(hc[role] ? { highContrast: hc[role] } : {}) }
    })
    themes[name] = { name, scheme: themeScheme(tokens, source), roles }
  }
  const p = tokens.primitives
  return {
    roles: tokens.roles,
    themes,
    space: p.space,
    radius: p.radius,
    fontSize: p['font-size'],
    durations: tokens.motion.duration,
    easings: tokens.motion.easing,
    springs: tokens.motion.spring,
    elevation: tokens.elevation,
    component: tokens.component,
  }
}
