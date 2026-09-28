/** Contrast for Alert, FlashBanner and Toast text on their tone fill, in every theme (spec §9). */
import { describe, expect, it } from 'vitest'
import { loadTokens, resolveTheme, themeVariants } from '../../scripts/lib/tokens.mjs'
import { TONES, TONE_INK_PCT, TONE_ROLE, TONE_TINT_PCT } from '../display/tone'
import { AA_NON_TEXT, AA_TEXT, contrastRatio, mix } from '../utils/contrast'

const tokens = loadTokens()

describe.each(themeVariants(tokens))('feedback contrast: $id', ({ theme, palette }) => {
  const roles = resolveTheme(tokens, theme, palette) as Record<string, string>
  it.each(TONES.map((t) => TONE_ROLE[t]))('title (ink), body (ink-2) and icon on the %s fill', (role) => {
    const fill = mix(roles.surface!, roles[role]!, TONE_TINT_PCT / 100)
    const icon = mix(roles[role]!, roles.ink!, TONE_INK_PCT / 100)
    expect(contrastRatio(roles.ink!, fill)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(roles['ink-2']!, fill)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(icon, fill)).toBeGreaterThanOrEqual(AA_NON_TEXT)
  })
})
