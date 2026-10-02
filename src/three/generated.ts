/**
 * three.js colour ints generated from tokens.json (spec §2.1, §6.5). The table in
 * generated-colors.json is written by scripts/build-tokens.mjs from scripts/lib/tokens.mjs
 * threeColorTable(), the same resolution that writes dist/three-tokens.mjs (`@trident/ui/three.mjs`);
 * src/three/__tests__/units.test.ts pins the file to tokens.json and both outputs as equal.
 *
 * Precomputed rather than resolved here so the lazy 3D payload carries only these ints, not all of
 * tokens.json (about 2.6 kB gz of the ≤250KB budget, spec §6.6). The light entry still reaches this
 * module only through a dynamic import (loadGeneratedColors) and the scene chunk.
 */
import { palettes, themes } from './generated-colors.json'
import { DEFAULT_THEME, type ThreeColorMap } from './colors'

type IntMap = Record<string, number>
const THEMES = themes as Record<string, IntMap>
const PALETTES = palettes as Record<string, Record<string, IntMap>>

const cache = new Map<string, ThreeColorMap>()

/** Theme names that have generated colours. */
export const threeThemeNames: readonly string[] = Object.freeze(Object.keys(THEMES))

/**
 * Resolved hex roles for a theme (and optional `data-portal-palette`) as 0xRRGGBB ints.
 * Unknown themes fall back to trident-studio; unknown palettes are ignored.
 */
export function generatedColors(theme: string = DEFAULT_THEME, palette?: string): ThreeColorMap {
  const name = Object.hasOwn(THEMES, theme) ? theme : DEFAULT_THEME
  const variants = Object.hasOwn(PALETTES, name) ? PALETTES[name] : undefined
  const pal = palette && variants && Object.hasOwn(variants, palette) ? palette : ''
  const key = `${name}|${pal}`
  const hit = cache.get(key)
  if (hit) return hit
  const frozen: ThreeColorMap = Object.freeze({ ...(pal ? variants?.[pal] : THEMES[name]) })
  cache.set(key, frozen)
  return frozen
}
