/**
 * WCAG 2.x contrast helpers and runtime accent correction (spec §2.3).
 *
 * `ensureContrast(accent, bg)` takes any accent a tenant or client supplied (Ops
 * `tenant.branding.primary_color`, WMH per-client `portalTheme`, portfolio `site.accent`) and returns
 * values that are safe to write into `--ui-accent-1`, `--ui-on-accent` and `--ui-accent-text`.
 */

export type Rgb = readonly [r: number, g: number, b: number]

/** AA thresholds used across the package. */
export const AA_TEXT = 4.5
export const AA_LARGE_TEXT = 3
export const AA_NON_TEXT = 3

/** Ink candidates for text on an accent fill (spec §2.3). */
export const DARK_INK = '#0b1220'
export const LIGHT_INK = '#ffffff'

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseHex(input: string): Rgb {
  const m = HEX.exec(input.trim())
  if (!m) throw new TypeError(`ensureContrast: expected #rgb or #rrggbb, got ${JSON.stringify(input)}`)
  let body = m[1]!.toLowerCase()
  if (body.length === 3) body = [...body].map((c) => c + c).join('')
  const n = Number.parseInt(body, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function isHex(input: string): boolean {
  return HEX.test(input.trim())
}

export function toHex([r, g, b]: Rgb): string {
  const c = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function channel(v: number): number {
  const s = v / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(color: string | Rgb): number {
  const [r, g, b] = typeof color === 'string' ? parseHex(color) : color
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two opaque colours, 1 to 21. */
export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Linear sRGB-space mix: t=0 returns a, t=1 returns b. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a)
  const cb = parseHex(b)
  return toHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t])
}

/**
 * Move `color` toward white (on a dark bg) or black (on a light bg) by the smallest step that
 * reaches `min` against `bg`. Returns the colour unchanged if it already passes.
 * Binary search over the mix amount keeps the hue and gives the closest passing shade.
 */
export function adjustToContrast(color: string, bg: string, min: number): string {
  const start = toHex(parseHex(color))
  if (contrastRatio(start, bg) >= min) return start
  const target = relativeLuminance(bg) < 0.18 ? '#ffffff' : '#000000'
  if (contrastRatio(target, bg) < min) return target // nothing reaches min; best effort
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (contrastRatio(mix(start, target, mid), bg) >= min) hi = mid
    else lo = mid
  }
  // Rounding to 8-bit channels can land a hair under min; nudge until it passes.
  let t = hi
  let out = mix(start, target, t)
  while (contrastRatio(out, bg) < min && t < 1) {
    t = Math.min(1, t + 0.005)
    out = mix(start, target, t)
  }
  return out
}

/** Whichever of #0b1220 / #ffffff contrasts more with `fill`. */
export function pickOnAccent(fill: string): string {
  return contrastRatio(DARK_INK, fill) >= contrastRatio(LIGHT_INK, fill) ? DARK_INK : LIGHT_INK
}

export interface EnsureContrastOptions {
  /** Minimum for accent used as text (default 4.5, AA body text). */
  textMin?: number
  /** Minimum for the accent fill against the background (default 3, AA non-text). */
  fillMin?: number
  /** Minimum for --ui-on-accent text on the fill (default 4.5, spec §9 "on-accent on accent"). */
  onAccentMin?: number
  /** Extra backgrounds the accent text must also pass on (e.g. --ui-surface). */
  alsoOn?: readonly string[]
}

export interface EnsureContrastResult {
  /** The input, normalised to #rrggbb. */
  input: string
  /** Accent fill for --ui-accent-1: the input, or a clamped shade if it fell below fillMin. */
  fill: string
  /** Ink for text on the fill (--ui-on-accent). */
  onAccent: string
  /** Accent shade for text (--ui-accent-text), >= textMin on bg and every alsoOn background. */
  accentText: string
  /** True when fill or accentText differ from the input. */
  adjusted: boolean
  ratios: { fillOnBg: number; onAccentOnFill: number; accentTextOnBg: number }
}

/**
 * Make an arbitrary accent safe on a given background (spec §2.3):
 * - clamps a fill that falls below 3:1 against the background;
 * - picks --ui-on-accent as #0b1220 or #ffffff, whichever contrasts more with the fill;
 * - derives an accent-text shade that reaches 4.5:1 on bg (and on every `alsoOn` surface).
 */
export function ensureContrast(hex: string, bg: string, options: EnsureContrastOptions = {}): EnsureContrastResult {
  const { textMin = AA_TEXT, fillMin = AA_NON_TEXT, onAccentMin = AA_TEXT, alsoOn = [] } = options
  const input = toHex(parseHex(hex))
  const bgHex = toHex(parseHex(bg))
  let fill = adjustToContrast(input, bgHex, fillMin)
  const onAccent = pickOnAccent(fill)
  // Mid-luminance accents (e.g. Ops' default #6366f1: 4.47:1 with white) reach neither ink at 4.5:1.
  // Nudge the fill away from the chosen ink, but never below fillMin against the background.
  const inked = adjustToContrast(fill, onAccent, onAccentMin)
  if (contrastRatio(inked, bgHex) >= fillMin) fill = inked
  let accentText = adjustToContrast(input, bgHex, textMin)
  for (const surface of alsoOn) accentText = adjustToContrast(accentText, surface, textMin)
  // A later surface can in principle push the shade back under on bg; re-check once.
  accentText = adjustToContrast(accentText, bgHex, textMin)
  return {
    input,
    fill,
    onAccent,
    accentText,
    adjusted: fill !== input || accentText !== input,
    ratios: {
      fillOnBg: contrastRatio(fill, bgHex),
      onAccentOnFill: contrastRatio(onAccent, fill),
      accentTextOnBg: contrastRatio(accentText, bgHex),
    },
  }
}

/**
 * The CSS custom properties to apply for a runtime accent, e.g.
 * `Object.assign(document.documentElement.style, ...)` via setProperty, or an SSR `style` attribute.
 */
export function accentVars(hex: string, bg: string, options?: EnsureContrastOptions): Record<string, string> {
  const r = ensureContrast(hex, bg, options)
  return {
    '--ui-accent-1': r.fill,
    '--ui-on-accent': r.onAccent,
    '--ui-accent-text': r.accentText,
    '--ui-focus': r.accentText,
  }
}
