/**
 * Shared tone model for display and feedback components (Badge, StatusPill, Chip, StatCard trend,
 * Alert, FlashBanner, Toast). Every tone maps to one semantic --ui-* role; the CSS in
 * src/display/styles.css derives the fill and text from that role with the two constants below,
 * and src/display/tone.test.ts proves the result reaches 4.5:1 in every theme and palette.
 */

/** Canonical tones. Each is always paired with visible text (spec §7: text plus colour, never colour alone). */
export type Tone = 'neutral' | 'accent' | 'info' | 'ok' | 'warn' | 'danger'

/**
 * Names accepted for compatibility: the portal `_ds_bundle.js` Badge tones (violet, blue, gold,
 * success, warning, danger) and the feedback names (success, warning, error).
 */
export type ToneAlias = 'violet' | 'blue' | 'gold' | 'success' | 'warning' | 'error'

export type ToneName = Tone | ToneAlias

export const TONES: readonly Tone[] = ['neutral', 'accent', 'info', 'ok', 'warn', 'danger']

const ALIASES: Record<ToneAlias, Tone> = {
  violet: 'accent',
  blue: 'info',
  gold: 'warn',
  success: 'ok',
  warning: 'warn',
  error: 'danger',
}

/** Semantic role (the `--ui-<role>` token) each tone reads. */
export const TONE_ROLE: Record<Tone, string> = {
  neutral: 'ink-2',
  accent: 'accent-text',
  info: 'info',
  ok: 'ok',
  warn: 'warn',
  danger: 'danger',
}

/** Fill = color-mix(in srgb, <role> TONE_TINT_PCT%, var(--ui-surface)). Mirrored in styles.css. */
export const TONE_TINT_PCT = 12
/** Text = color-mix(in srgb, <role> (100 - TONE_INK_PCT)%, var(--ui-ink)). Mirrored in styles.css. */
export const TONE_INK_PCT = 25

/** Resolve any accepted tone name to a canonical tone. Unknown values fall back to `fallback`. */
export function normalizeTone(tone: string | undefined | null, fallback: Tone = 'neutral'): Tone {
  if (!tone) return fallback
  if ((TONES as readonly string[]).includes(tone)) return tone as Tone
  return ALIASES[tone as ToneAlias] ?? fallback
}

/** Plain-language name of a tone, for visually hidden prefixes ("Error: ..."). */
export const TONE_LABEL: Record<Tone, string> = {
  neutral: 'Note',
  accent: 'Note',
  info: 'Info',
  ok: 'Success',
  warn: 'Warning',
  danger: 'Error',
}
