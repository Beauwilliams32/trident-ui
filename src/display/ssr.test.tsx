/**
 * SSR safety: the display group imports and renders with `window` and `document` removed, and the
 * server HTML is the final state (StatCard values, nothing hidden).
 *
 * The shared test/setup.ts needs jsdom, so this runs under jsdom with the browser globals stubbed
 * out for the import and render.
 */
// eslint-disable-next-line no-restricted-imports -- test-only: proves the components render on the server
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.resetModules()
  vi.stubGlobal('window', undefined)
  vi.stubGlobal('document', undefined)
})
afterAll(() => {
  vi.unstubAllGlobals()
})

describe('display SSR', () => {
  it('imports without window/document', async () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
    const mod = await import('./index')
    expect(typeof mod.Card).toBe('function')
    expect(mod.pointerMotionAllowed()).toBe(false)
  })

  it('renders every gallery example to a string', async () => {
    const { examples } = await import('./display.gallery')
    for (const ex of examples) {
      const html = renderToString(ex.render())
      expect(html.length, `${ex.component}: ${ex.name}`).toBeGreaterThan(0)
    }
  })

  it('StatCard server HTML already holds the final value', async () => {
    const { StatCard } = await import('./StatCard')
    const html = renderToString(<StatCard label="Posts" value={1284} countUp />)
    expect(html).toContain('>1,284<')
    expect(html).toContain('data-count-to="1284"')
    expect(html).not.toMatch(/opacity|hidden="/)
  })
})
