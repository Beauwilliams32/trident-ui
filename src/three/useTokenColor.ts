import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import { DEFAULT_THEME, generatedColorsIfLoaded, loadGeneratedColors, onGeneratedColors, parseCssColor, type ThreeColorMap } from './colors'
import { isBrowser } from './env'

/**
 * The element whose theme a scene should read. `<Lazy3D>` provides its own container, so a scene
 * inside a nested `[data-theme]` (the gallery, a themed card) picks up that theme. R3F 9 bridges
 * React context into the canvas, so hooks inside the scene see it too.
 */
export const ThemeScopeContext = createContext<Element | null>(null)

export interface TokenColorOptions {
  /** Force a theme instead of reading `[data-theme]` from the DOM. */
  theme?: string
  /** Force a `data-portal-palette` variant. */
  palette?: string
}

/** Returned for a role before the generated map has loaded and no CSS value is available. */
export const UNRESOLVED_COLOR = 0xffffff
const EMPTY: ThreeColorMap = Object.freeze({})

function scopeElement(scope: Element | null): Element | null {
  if (scope) return scope
  return isBrowser() ? document.documentElement : null
}

function themeOf(el: Element | null, opts: TokenColorOptions | undefined): { theme: string; palette: string | undefined } {
  const theme = opts?.theme ?? el?.closest('[data-theme]')?.getAttribute('data-theme') ?? DEFAULT_THEME
  const palette = opts?.palette ?? el?.closest('[data-portal-palette]')?.getAttribute('data-portal-palette') ?? undefined
  return { theme, palette }
}

function generatedRole(theme: string, palette: string | undefined, role: string): number {
  return generatedColorsIfLoaded(theme, palette)?.[role] ?? generatedColorsIfLoaded(DEFAULT_THEME)?.[role] ?? UNRESOLVED_COLOR
}

/**
 * One role as a 0xRRGGBB int. Runtime first (the computed `--ui-<role>` custom property, so a
 * tenant accent passed through ensureContrast wins), falling back to the generated
 * `@trident/ui/three.mjs` value for the active theme. Never reads the DOM during SSR.
 */
export function readTokenColor(role: string, scope: Element | null = null, opts?: TokenColorOptions): number {
  const el = scopeElement(scope)
  const { theme, palette } = themeOf(el, opts)
  if (el && !opts?.theme && typeof getComputedStyle === 'function') {
    const live = parseCssColor(getComputedStyle(el).getPropertyValue(`--ui-${role}`))
    if (live !== null) return live
  }
  return generatedRole(theme, palette, role)
}

/** Every hex role of the active theme as ints, runtime values layered over generated ones. */
export function readBrandColors(scope: Element | null = null, opts?: TokenColorOptions): ThreeColorMap {
  const el = scopeElement(scope)
  const { theme, palette } = themeOf(el, opts)
  const generated = generatedColorsIfLoaded(theme, palette) ?? EMPTY
  if (!el || opts?.theme || typeof getComputedStyle !== 'function') return generated
  const style = getComputedStyle(el)
  let out: Record<string, number> | null = null
  for (const role of Object.keys(generated)) {
    const live = parseCssColor(style.getPropertyValue(`--ui-${role}`))
    if (live !== null && live !== generated[role]) (out ??= { ...generated })[role] = live
  }
  return out ? Object.freeze(out) : generated
}

function subscribeTheme(onChange: () => void): () => void {
  const offGenerated = onGeneratedColors(onChange)
  if (!isBrowser() || typeof MutationObserver !== 'function') return offGenerated
  const root = document.documentElement
  const tree = new MutationObserver(onChange)
  tree.observe(root, { attributes: true, subtree: true, attributeFilter: ['data-theme', 'data-scheme', 'data-portal-palette'] })
  const inline = new MutationObserver(onChange)
  inline.observe(root, { attributes: true, attributeFilter: ['style', 'class'] })
  return () => {
    offGenerated()
    tree.disconnect()
    inline.disconnect()
  }
}

/** Make sure the generated fallback is (being) fetched once a hook is used on the client. */
function useGeneratedColors(): void {
  useEffect(() => {
    void loadGeneratedColors()
  }, [])
}

/** A single brand/role colour for three.js, e.g. `useTokenColor('accent-1')`. */
export function useTokenColor(role: string, opts?: TokenColorOptions): number {
  useGeneratedColors()
  const scope = useContext(ThemeScopeContext)
  const theme = opts?.theme
  const palette = opts?.palette
  const get = useCallback(() => readTokenColor(role, scope, { theme, palette }), [role, scope, theme, palette])
  const server = useCallback(() => generatedRole(theme ?? DEFAULT_THEME, palette, role), [role, theme, palette])
  return useSyncExternalStore(subscribeTheme, get, server)
}

const brandCache = new Map<string, ThreeColorMap>()

function stable(map: ThreeColorMap): ThreeColorMap {
  const key = JSON.stringify(map)
  const hit = brandCache.get(key)
  if (hit) return hit
  if (brandCache.size > 64) brandCache.clear()
  brandCache.set(key, map)
  return map
}

/** All hex roles of the active theme (bg, ink, accent-1, accent-2, status-live, ...) as ints. */
export function useBrandColors(opts?: TokenColorOptions): ThreeColorMap {
  useGeneratedColors()
  const scope = useContext(ThemeScopeContext)
  const theme = opts?.theme
  const palette = opts?.palette
  const get = useCallback(() => stable(readBrandColors(scope, { theme, palette })), [scope, theme, palette])
  const server = useCallback(() => generatedColorsIfLoaded(theme ?? DEFAULT_THEME, palette) ?? EMPTY, [theme, palette])
  return useSyncExternalStore(subscribeTheme, get, server)
}
