import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react'
import { mq, paused, subscribeMotion } from '../motion-lite'

/** useLayoutEffect on the client, nothing on the server (no SSR warning, no flash on mount). */
export const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect

const REDUCE = '(prefers-reduced-motion: reduce)'
function subscribeReduced(cb: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  try {
    const list = window.matchMedia(REDUCE)
    list.addEventListener?.('change', cb)
    return () => list.removeEventListener?.('change', cb)
  } catch {
    return () => {}
  }
}

/** True while html[data-motion="paused"] is set. Server snapshot: false. */
export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotion, paused, () => false)
}

/** True while the OS asks for reduced motion. Server snapshot: false. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => mq(REDUCE), () => false)
}

/** Reduced motion OR Pause: render final states, start no animation. */
export function useMotionOff(): boolean {
  const isPaused = useMotionPaused()
  const isReduced = usePrefersReducedMotion()
  return isPaused || isReduced
}
