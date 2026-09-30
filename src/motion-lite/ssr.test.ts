/**
 * SSR safety: with no window/document/navigator, a fresh import of motion-lite must not throw and
 * every probe must degrade to "no motion, not low power". (The shared test setup needs jsdom, so
 * the globals are removed here instead of using the node environment.)
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('motion-lite without a DOM', () => {
  it('imports and degrades', async () => {
    vi.resetModules()
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('navigator', undefined)
    const m = await import('./index')
    expect(m.hasDOM()).toBe(false)
    expect(m.reduced()).toBe(false)
    expect(m.paused()).toBe(false)
    expect(m.lowPower()).toBe(false)
    expect(m.bindTilt()).toBe(false)
    expect(m.scanReveals()).toBe(0)
    expect(() => m.initMotion()()).not.toThrow()
    expect(() => m.setMotionPaused(true)).not.toThrow()
    let ran = false
    expect(m.transition(() => (ran = true))).toBeNull()
    expect(ran).toBe(true)
  })
})
