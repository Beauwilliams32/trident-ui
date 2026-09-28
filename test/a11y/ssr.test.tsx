/**
 * SSR safety for the a11y, layout and type groups: the modules import with window and document
 * removed, every component renders to a string on the server, no component emits an inline
 * style (strict style-src CSP), and every ui-* class emitted exists in the group stylesheets.
 *
 * (The shared test/setup.ts needs jsdom, so this suite removes the browser globals itself and
 * re-imports the modules fresh instead of using the node environment.)
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import type { ReactNode } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

type Examples = Array<{ id: string; render: () => ReactNode }>
let all: Examples = []

beforeAll(async () => {
  vi.stubGlobal('window', undefined)
  vi.stubGlobal('document', undefined)
  vi.stubGlobal('navigator', undefined)
  vi.resetModules()
  const [a, l, t] = await Promise.all([
    import('../../src/a11y/a11y.gallery'),
    import('../../src/layout/layout.gallery'),
    import('../../src/type/type.gallery'),
  ])
  all = [...a.examples, ...l.examples, ...t.examples]
})

afterAll(() => {
  vi.unstubAllGlobals()
})

const ROOT = join(import.meta.dirname, '..', '..')
const css = ['src/styles/base.css', 'src/a11y/styles.css', 'src/layout/styles.css', 'src/type/styles.css']
  .map((f) => readFileSync(join(ROOT, f), 'utf8'))
  .join('\n')

describe('SSR', () => {
  it('runs without window or document', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
  })

  it('the root entry imports on the server', async () => {
    const ui = await import('../../src/index')
    for (const name of ['SkipLink', 'VisuallyHidden', 'LiveAnnouncer', 'FocusRing', 'Container', 'Stack', 'Cluster', 'Grid', 'Section', 'Heading', 'Text', 'Kicker', 'GradText', 'Mono', 'Code', 'Kbd', 'Prose']) {
      expect(typeof (ui as Record<string, unknown>)[name], name).toBe('function')
    }
  })

  it('every gallery example renders on the server, CSP-safe, with defined classes', () => {
    expect(all.length).toBeGreaterThanOrEqual(14)
    for (const ex of all) {
      const html = renderToString(<>{ex.render()}</>)
      expect(html.length, ex.id).toBeGreaterThan(0)
      expect(html, ex.id).not.toMatch(/\sstyle="/)
      const classes = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]!.split(/\s+/)).filter((c) => c.startsWith('ui-')))
      for (const c of classes) expect(css, `${ex.id}: .${c} is not defined in any stylesheet`).toMatch(new RegExp(`\\.${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`))
    }
  })

  it('LiveAnnouncer regions are in the server markup', async () => {
    const { LiveAnnouncer } = await import('../../src/index')
    const html = renderToString(<LiveAnnouncer />)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-live="assertive"')
  })
})
