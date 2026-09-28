/**
 * Browser probes for the 3D gates (spec §6.4, §6.5). Every function is safe to call during SSR
 * (it returns the conservative answer) and nothing here touches `window` at import time.
 */

export type QualityTier = 'off' | 'low' | 'high'

/** Viewport widths from spec §0.2: heroes need 980px; small scenes may go down to 768px. */
export const HERO_MIN_WIDTH = 980
export const SMALL_SCENE_MIN_WIDTH = 768

/** `[data-surface]` values where `<Lazy3D>` refuses to mount (spec §6.8). */
export const FORBIDDEN_SURFACES = ['money', 'auth', 'legal', 'admin'] as const

export const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined'

function media(query: string): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia(query).matches
  } catch {
    return false
  }
}

export const prefersReducedMotion = (): boolean => media('(prefers-reduced-motion: reduce)')

export const isCoarsePointer = (): boolean => media('(pointer: coarse)')

/** The persistent "Pause motion" control sets html[data-motion="paused"] (spec §6.3 rule 5). */
export function isMotionPaused(): boolean {
  if (!isBrowser()) return false
  return document.documentElement.getAttribute('data-motion') === 'paused'
}

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}
interface NavigatorLike {
  connection?: NetworkInformationLike
  deviceMemory?: number
  hardwareConcurrency?: number
}

/**
 * Same thresholds as 07-motion.js (spec §0.2): Save-Data, deviceMemory < 4,
 * hardwareConcurrency < 4, or an effective connection type of 2g (or slow-2g).
 */
export function lowPower(nav: NavigatorLike | undefined = typeof navigator === 'undefined' ? undefined : (navigator as NavigatorLike)): boolean {
  if (!nav) return false
  const c = nav.connection
  if (c?.saveData) return true
  if (typeof c?.effectiveType === 'string' && /(^|-)2g$/.test(c.effectiveType)) return true
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return true
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return true
  return false
}

export const viewportWidth = (): number => (isBrowser() ? window.innerWidth || document.documentElement.clientWidth || 0 : 0)

let webgl2Cache: boolean | undefined

/**
 * WebGL2 availability. Only call this after the quality tier is known not to be 'off': the probe
 * creates (and immediately releases) a throwaway WebGL2 context.
 */
export function hasWebGL2(): boolean {
  if (webgl2Cache !== undefined) return webgl2Cache
  if (!isBrowser() || typeof (window as { WebGL2RenderingContext?: unknown }).WebGL2RenderingContext === 'undefined') {
    return (webgl2Cache = false)
  }
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) as WebGL2RenderingContext | null
    webgl2Cache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl2Cache = false
  }
  return webgl2Cache
}

/** Test hook: forget the cached WebGL2 probe result. */
export function resetWebGL2Probe(): void {
  webgl2Cache = undefined
}

const NON_FIELD_INPUTS = new Set(['button', 'submit', 'reset', 'image', 'hidden'])

/** True for elements that count as "a form field has focus" (spec §6.8: no 3D while one does). */
export function isFormField(el: Element | null | undefined): boolean {
  if (!el || typeof el.tagName !== 'string') return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'textarea' || tag === 'select') return true
  if (tag === 'input') return !NON_FIELD_INPUTS.has(((el as HTMLInputElement).type || 'text').toLowerCase())
  const editable = el.getAttribute('contenteditable')
  return editable !== null && editable !== 'false'
}

export const formFieldFocused = (): boolean => (isBrowser() ? isFormField(document.activeElement) : false)

/** The forbidden `[data-surface]` an element sits under, if any. */
export function forbiddenSurface(el: Element | null | undefined): string | null {
  let node: Element | null = el ?? null
  while (node) {
    const surface = node.getAttribute('data-surface')
    if (surface) {
      for (const token of surface.split(/[\s|,]+/)) {
        if ((FORBIDDEN_SURFACES as readonly string[]).includes(token)) return token
      }
    }
    node = node.parentElement
  }
  return null
}

export interface QualityInputs {
  reducedMotion: boolean
  paused: boolean
  lowPower: boolean
  width: number
  coarsePointer: boolean
  performanceDeclined: boolean
}

/**
 * The tier rules (spec §6.4, §6.5). 'off' means no WebGL context may be created at all:
 * reduced motion, Pause, lowPower (which "applies the 3D rule too"), or a viewport below 768px.
 * 'low' covers the 768–979px band, coarse pointers and a PerformanceMonitor step-down.
 */
export function computeQualityTier(i: QualityInputs): QualityTier {
  if (i.reducedMotion || i.paused || i.lowPower) return 'off'
  if (i.width < SMALL_SCENE_MIN_WIDTH) return 'off'
  if (i.width < HERO_MIN_WIDTH || i.coarsePointer || i.performanceDeclined) return 'low'
  return 'high'
}
