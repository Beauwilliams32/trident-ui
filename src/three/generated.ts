/**
 * three.js colour ints generated from tokens.json (spec §2.1, §6.5). Resolves the same way as
 * scripts/lib/tokens.mjs threeColors(), which writes dist/three-tokens.mjs (`@trident/ui/three.mjs`);
 * src/three/colors.test.ts pins the two as equal. This module carries the token data, so the light
 * entry only reaches it through a dynamic import (loadGeneratedColors) and the scene chunk.
 */
import { base, primitives, themes } from '../../tokens.json'
import { DEFAULT_THEME, hexToInt, type ThreeColorMap } from './colors'
type RoleMap = Record<string, string>
interface ThemeDef {
  extends?: string
  roles: RoleMap
  palettes?: Record<string, RoleMap>
}

const THEMES = themes as unknown as Record<string, ThemeDef>
const BASES = base as unknown as Record<string, { roles: RoleMap }>
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function primitive(path: string): string {
  let node: unknown = primitives
  for (const key of path.split('.')) {
    if (node == null || typeof node !== 'object' || !(key in node)) return ''
    node = (node as Record<string, unknown>)[key]
  }
  return typeof node === 'string' ? node : ''
}

function resolveRoles(roles: RoleMap): RoleMap {
  const out: RoleMap = {}
  const visiting = new Set<string>()
  const resolve = (name: string): string => {
    if (name in out) return out[name] as string
    if (!(name in roles) || visiting.has(name)) return ''
    visiting.add(name)
    const value = String(roles[name]).replace(/\{([^}]+)\}/g, (_m, ref: string) => (ref.startsWith('p.') ? primitive(ref.slice(2)) : resolve(ref)))
    visiting.delete(name)
    out[name] = value
    return value
  }
  for (const name of Object.keys(roles)) resolve(name)
  return out
}

const cache = new Map<string, ThreeColorMap>()

/** Theme names that have generated colours. */
export const threeThemeNames: readonly string[] = Object.freeze(Object.keys(THEMES))

/**
 * Resolved hex roles for a theme (and optional `data-portal-palette`) as 0xRRGGBB ints.
 * Unknown themes fall back to trident-studio; unknown palettes are ignored.
 */
export function generatedColors(theme: string = DEFAULT_THEME, palette?: string): ThreeColorMap {
  const name = theme in THEMES ? theme : DEFAULT_THEME
  const def = THEMES[name] as ThemeDef
  const pal = palette && def.palettes?.[palette] ? palette : ''
  const key = `${name}|${pal}`
  const hit = cache.get(key)
  if (hit) return hit
  const baseRoles = def.extends ? (BASES[def.extends]?.roles ?? {}) : {}
  const resolved = resolveRoles({ ...baseRoles, ...def.roles, ...(pal ? def.palettes?.[pal] : {}) })
  const ints: Record<string, number> = {}
  for (const [role, value] of Object.entries(resolved)) if (HEX_RE.test(value)) ints[role] = hexToInt(value)
  const frozen = Object.freeze(ints)
  cache.set(key, frozen)
  return frozen
}

