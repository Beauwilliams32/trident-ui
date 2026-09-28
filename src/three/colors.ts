/**
 * Colour helpers for the light @trident/ui/three entry. The generated per-theme map (which carries
 * tokens.json) is a separate chunk: loadGeneratedColors() fetches it, and <Lazy3D> loads it
 * together with the scene kit, so it is always present by the time a scene renders.
 */
import type * as Generated from './generated'

export const DEFAULT_THEME = 'trident-studio'

export type ThreeColorMap = Readonly<Record<string, number>>

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function hexToInt(hex: string): number {
  let body = hex.trim().replace(/^#/, '').toLowerCase()
  if (body.length === 3) body = [...body].map((c) => c + c).join('')
  return Number.parseInt(body, 16)
}

/**
 * Parse a computed CSS colour (`#rgb`, `#rrggbb`, `rgb()`/`rgba()`) into a 0xRRGGBB int.
 * Anything else (color-mix(), gradients, empty) returns null so callers use the generated value.
 */
export function parseCssColor(value: string | null | undefined): number | null {
  const v = (value ?? '').trim()
  if (!v) return null
  if (HEX_RE.test(v)) return hexToInt(v)
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v)
  if (!m) return null
  const [r, g, b] = [m[1], m[2], m[3]].map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))))
  return ((r as number) << 16) | ((g as number) << 8) | (b as number)
}

/** 0xRRGGBB -> [r, g, b] in 0..1 (for shader uniforms). */
export function intToRgb(n: number): [number, number, number] {
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

let generated: typeof Generated | null = null
let pending: Promise<typeof Generated> | null = null
const listeners = new Set<() => void>()

/** Fetch the generated colour map (once). Resolves to the module with generatedColors(). */
export function loadGeneratedColors(): Promise<typeof Generated> {
  if (generated) return Promise.resolve(generated)
  pending ??= import('./generated').then((m) => {
    generated = m
    listeners.forEach((fn) => fn())
    return m
  })
  return pending
}

/** The generated map for a theme if it has loaded, else null. */
export function generatedColorsIfLoaded(theme?: string, palette?: string): ThreeColorMap | null {
  return generated ? generated.generatedColors(theme, palette) : null
}

export function onGeneratedColors(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
