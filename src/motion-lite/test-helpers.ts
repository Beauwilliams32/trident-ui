/**
 * Test-only helpers shared by the motion-lite and motion suites (spec §10.2): a matchMedia stub
 * for reduced motion / fine pointer, a recording IntersectionObserver, and a rAF spy.
 * Not exported from any entry.
 */
import { vi } from 'vitest'

export interface MediaFlags {
  reduce?: boolean
  fine?: boolean
}

export function stubMatchMedia(flags: MediaFlags = {}): void {
  const matchMedia = (query: string) => ({
    matches:
      (query.includes('prefers-reduced-motion: reduce') && !!flags.reduce) ||
      (query.includes('prefers-reduced-motion: no-preference') && !flags.reduce) ||
      (query.includes('pointer: fine') && !!flags.fine),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia })
}

export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  observed = new Set<Element>()
  constructor(public callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this)
  }
  observe(el: Element) {
    this.observed.add(el)
  }
  unobserve(el: Element) {
    this.observed.delete(el)
  }
  disconnect() {
    this.observed.clear()
  }
  takeRecords() {
    return []
  }
  /** Fire an intersecting entry for `el`. */
  enter(el: Element) {
    this.callback([{ target: el, isIntersecting: true } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
  static reset() {
    FakeIntersectionObserver.instances = []
  }
  static observing(el: Element) {
    return FakeIntersectionObserver.instances.find((o) => o.observed.has(el))
  }
}

/** Install the fake IO and a rAF spy that queues frames; returns the spy and a frame pump. */
export function installMotionStubs() {
  FakeIntersectionObserver.reset()
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  const frames: FrameRequestCallback[] = []
  const raf = vi.fn((cb: FrameRequestCallback) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('requestAnimationFrame', raf)
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  const pump = (now: number) => {
    const batch = frames.splice(0)
    for (const cb of batch) cb(now)
    return batch.length
  }
  return { raf, pump }
}

/**
 * A fresh in-memory localStorage on window (Node 26 ships its own global localStorage that is
 * undefined without --localstorage-file and shadows jsdom's). `throwing` simulates blocked storage.
 */
export function installStorage(throwing = false): Storage {
  const data = new Map<string, string>()
  const fail = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError')
  }
  const storage = {
    get length() {
      return data.size
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => (throwing ? fail() : (data.get(k) ?? null)),
    setItem: (k: string, v: string) => (throwing ? fail() : void data.set(k, String(v))),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  } as Storage
  Object.defineProperty(window, 'localStorage', { configurable: true, get: () => storage })
  return storage
}

export function resetMotionDom(): void {
  const root = document.documentElement
  root.removeAttribute('data-motion')
  root.removeAttribute('data-theme')
  root.removeAttribute('data-scheme')
  root.removeAttribute('data-vt')
  root.classList.remove('ui-motion', 'ui-vt')
  document.body.innerHTML = ''
  installStorage()
}
