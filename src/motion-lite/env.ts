/**
 * Environment probes (spec §6.4). Every function is SSR-safe: nothing touches `window` at import
 * time, and each probe returns the "no motion / not low power" answer when there is no DOM.
 */

/** Minimal shape of `navigator` that lowPower() reads (Network Information API is non-standard). */
export interface LowPowerNavigator {
  deviceMemory?: number
  hardwareConcurrency?: number
  connection?: { saveData?: boolean; effectiveType?: string }
  mozConnection?: { saveData?: boolean; effectiveType?: string }
  webkitConnection?: { saveData?: boolean; effectiveType?: string }
}

export const hasDOM = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined'

/** `matchMedia(query).matches`, false without a DOM or when matchMedia throws. */
export function mq(query: string): boolean {
  try {
    return hasDOM() && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  } catch {
    return false
  }
}

/** The person asked the OS for less motion. */
export const reduced = (): boolean => mq('(prefers-reduced-motion: reduce)')

/** The persistent "Pause motion" control is on (`html[data-motion="paused"]`, spec §6.3 rule 5). */
export const paused = (): boolean => hasDOM() && document.documentElement.getAttribute('data-motion') === 'paused'

/** Reduced motion OR paused: movement becomes an instant change (spec §6.4). */
export const motionOff = (): boolean => reduced() || paused()

/** A mouse or trackpad that can hover: the only input Tilt responds to. */
export const finePointer = (): boolean => mq('(hover: hover) and (pointer: fine)')

/**
 * Low-power heuristic (spec §0.2): any one signal is enough — Save-Data, `deviceMemory < 4`,
 * `hardwareConcurrency < 4`, or an effective connection type of 2g / slow-2g.
 * lowPower() gates 3D and heavy effects only; micro-transitions stay (spec §6.4).
 */
export function lowPower(nav?: LowPowerNavigator): boolean {
  const n: LowPowerNavigator = nav ?? (typeof navigator !== 'undefined' ? (navigator as LowPowerNavigator) : {})
  const conn = n.connection ?? n.mozConnection ?? n.webkitConnection ?? {}
  if (conn.saveData) return true
  if (typeof n.deviceMemory === 'number' && n.deviceMemory < 4) return true
  if (typeof n.hardwareConcurrency === 'number' && n.hardwareConcurrency < 4) return true
  if (typeof conn.effectiveType === 'string' && /(^|-)2g$/.test(conn.effectiveType)) return true
  return false
}

/** Read a time/number token (`600ms`, `0.6s`, `7deg`, `6`) from :root, falling back when unset. */
export function tokenNumber(name: string, fallback: number): number {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    const n = parseFloat(raw)
    if (!Number.isFinite(n)) return fallback
    return /ms$/.test(raw) ? n : /s$/.test(raw) ? n * 1000 : n
  } catch {
    return fallback
  }
}
