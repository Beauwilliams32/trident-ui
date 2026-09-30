/**
 * SSR safety for the feedback group: imports and renders with `window` and `document` removed.
 * Runs under jsdom (test/setup.ts needs it) with the browser globals stubbed out.
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

describe('feedback SSR', () => {
  it('renders every gallery example with no window/document', async () => {
    expect(typeof window).toBe('undefined')
    const { examples } = await import('./feedback.gallery')
    for (const ex of examples) {
      expect(renderToString(ex.render()).length, `${ex.component}: ${ex.name}`).toBeGreaterThan(0)
    }
  })

  it('FlashBanner server HTML carries role, tone and message with no script', async () => {
    const { FlashBanner } = await import('./FlashBanner')
    const html = renderToString(<FlashBanner flash={{ type: 'error', message: 'Bad input.' }} id="flash-message" />)
    expect(html).toContain('role="alert"')
    expect(html).toContain('data-tone="danger"')
    expect(html).toContain('Bad input.')
    expect(html).toContain('id="flash-message"')
    expect(html).not.toContain('<script')
  })
})
