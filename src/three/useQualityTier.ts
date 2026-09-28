import { useSyncExternalStore } from 'react'
import {
  computeQualityTier,
  isBrowser,
  isCoarsePointer,
  isMotionPaused,
  lowPower,
  prefersReducedMotion,
  viewportWidth,
  type QualityTier,
} from './env'

/* PerformanceMonitor reports into this tiny store, so every hook on the page sees the step-down. */
let performanceDeclined = false
const perfListeners = new Set<() => void>()

/** Called by `<SceneCanvas>` when PerformanceMonitor steps down past the dpr stage. */
export function reportPerformanceDecline(): void {
  if (performanceDeclined) return
  performanceDeclined = true
  perfListeners.forEach((fn) => fn())
}

/** Test hook: clear the page-wide performance step-down. */
export function resetPerformanceDecline(): void {
  performanceDeclined = false
  perfListeners.forEach((fn) => fn())
}

/** Current tier, computed from live browser state. 'off' during SSR. */
export function readQualityTier(): QualityTier {
  if (!isBrowser()) return 'off'
  return computeQualityTier({
    reducedMotion: prefersReducedMotion(),
    paused: isMotionPaused(),
    lowPower: lowPower(),
    width: viewportWidth(),
    coarsePointer: isCoarsePointer(),
    performanceDeclined,
  })
}

const QUERIES = ['(prefers-reduced-motion: reduce)', '(pointer: coarse)']

/** Subscribe to every input of the tier: media queries, resize, Pause (html[data-motion]) and perf. */
export function subscribeQuality(onChange: () => void): () => void {
  if (!isBrowser()) return () => {}
  const cleanups: Array<() => void> = []
  if (typeof window.matchMedia === 'function') {
    for (const q of QUERIES) {
      try {
        const mql = window.matchMedia(q)
        if (typeof mql.addEventListener === 'function') {
          mql.addEventListener('change', onChange)
          cleanups.push(() => mql.removeEventListener('change', onChange))
        }
      } catch {
        /* a matchMedia stub without listeners: nothing to subscribe to */
      }
    }
  }
  window.addEventListener('resize', onChange, { passive: true })
  cleanups.push(() => window.removeEventListener('resize', onChange))
  if (typeof MutationObserver === 'function') {
    const mo = new MutationObserver(onChange)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    cleanups.push(() => mo.disconnect())
  }
  perfListeners.add(onChange)
  cleanups.push(() => perfListeners.delete(onChange))
  return () => cleanups.forEach((fn) => fn())
}

const serverTier = (): QualityTier => 'off'

/**
 * `off` | `low` | `high` (spec §6.5), from reduced motion, lowPower, viewport width,
 * PerformanceMonitor and the Pause state. `off` means no WebGL context may be created.
 * Always `off` on the server and during hydration, so SSR renders the poster.
 */
export function useQualityTier(): QualityTier {
  return useSyncExternalStore(subscribeQuality, readQualityTier, serverTier)
}
