/** Browser stubs for the 3D gate tests (jsdom has no matchMedia, IntersectionObserver or WebGL). */
import { vi } from 'vitest'
import { resetWebGL2Probe } from '../env'
import { resetPerformanceDecline } from '../useQualityTier'

export interface EnvOptions {
  reduce?: boolean
  coarse?: boolean
  width?: number
  webgl2?: boolean
  intersecting?: boolean
  cores?: number
}

type Listener = () => void
export const mediaListeners = new Set<Listener>()

/** A fake WebGL2 context: just enough for the probe (getExtension -> lose_context). */
export const fakeGl = { getExtension: () => ({ loseContext: () => {} }) }

export function stubEnv({ reduce = false, coarse = false, width = 1280, webgl2 = true, intersecting = true, cores = 8 }: EnvOptions = {}) {
  const state = { reduce, coarse }
  mediaListeners.clear()
  window.matchMedia = ((query: string) => ({
    get matches() {
      if (query.includes('reduce')) return state.reduce
      if (query.includes('coarse')) return state.coarse
      const min = /min-width:\s*(\d+)px/.exec(query)
      return min ? width >= Number(min[1]) : false
    },
    media: query,
    onchange: null,
    addEventListener: (_t: string, fn: Listener) => mediaListeners.add(fn),
    removeEventListener: (_t: string, fn: Listener) => mediaListeners.delete(fn),
    addListener: (fn: Listener) => mediaListeners.add(fn),
    removeListener: (fn: Listener) => mediaListeners.delete(fn),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: cores })
  const w = window as unknown as Record<string, unknown>
  w.requestIdleCallback = (cb: () => void) => setTimeout(cb, 0) as unknown as number
  w.cancelIdleCallback = (id: number) => clearTimeout(id)
  class IO {
    constructor(private readonly cb: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void) {}
    observe(target: Element) {
      setTimeout(() => this.cb([{ isIntersecting: intersecting, target }]), 0)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  w.IntersectionObserver = IO
  if (webgl2) w.WebGL2RenderingContext = function WebGL2RenderingContext() {}
  else delete w.WebGL2RenderingContext
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(((type: string) => (type === 'webgl2' && webgl2 ? fakeGl : null)) as unknown as typeof HTMLCanvasElement.prototype.getContext)
  resetWebGL2Probe()
  resetPerformanceDecline()
  document.documentElement.removeAttribute('data-motion')
  return {
    getContext,
    /** Flip prefers-reduced-motion and notify listeners, like a real MediaQueryList change. */
    setReduce(on: boolean) {
      state.reduce = on
      mediaListeners.forEach((fn) => fn())
    },
    setCoarse(on: boolean) {
      state.coarse = on
      mediaListeners.forEach((fn) => fn())
    },
  }
}

/** Every getContext call that asked for a WebGL context. */
export function webglCalls(spy: { mock: { calls: unknown[][] } }): unknown[][] {
  return spy.mock.calls.filter(([type]) => typeof type === 'string' && /webgl/i.test(type))
}
