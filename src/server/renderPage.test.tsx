import { Suspense, use } from 'react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { faqPage } from './jsonld'
import { Island } from './Island'
import { renderPage, renderPageResponse, renderPageStream } from './renderPage'
import { THEME_SCHEMES, type ThemeName } from './themes'

function Later({ promise }: { promise: Promise<string> }) {
  return <p>{use(promise)}</p>
}
const later = (text: string, ms = 15) => new Promise<string>((r) => setTimeout(() => r(text), ms))

function Page() {
  return (
    <>
      <a href="#main" className="ui-skip">Skip to content</a>
      <main id="main">
        <h1>Deals</h1>
        <p>Static copy.</p>
      </main>
    </>
  )
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('renderPage', () => {
  it('sets data-theme and data-scheme on <html> server-side, with doctype, charset first and lang', async () => {
    const html = await renderPage({ theme: 'trident-nil', children: <Page /> })
    expect(html.startsWith('<!DOCTYPE html><html lang="en" data-theme="trident-nil" data-scheme="dark">')).toBe(true)
    expect(html.indexOf('<meta charSet="utf-8"/>')).toBeLessThan(200)
    expect(html).toContain('<meta name="color-scheme" content="dark"/>')
  })

  it('theme × scheme smoke: every package theme renders in both schemes, defaulting to its native one', async () => {
    for (const theme of Object.keys(THEME_SCHEMES) as ThemeName[]) {
      const native = parse(await renderPage({ theme, mode: 'string', children: <Page /> })).documentElement
      expect(native.dataset.theme).toBe(theme)
      expect(native.dataset.scheme).toBe(THEME_SCHEMES[theme])
      for (const scheme of ['dark', 'light'] as const) {
        const doc = parse(await renderPage({ theme, scheme, mode: 'string', children: <Page /> }))
        expect(doc.documentElement.dataset.scheme).toBe(scheme)
      }
    }
  })

  it('accepts client themes built on the token contract, but requires a scheme and a safe name', async () => {
    expect(await renderPage({ theme: 'kula', scheme: 'light', children: <Page /> })).toContain('data-theme="kula" data-scheme="light"')
    await expect(renderPage({ theme: 'kula', children: <Page /> })).rejects.toThrow(/pass scheme/)
    await expect(renderPage({ theme: '"><script>', scheme: 'dark' })).rejects.toThrow(/invalid theme/)
  })

  it('writes portal palette, paused motion and surface attributes', async () => {
    const doc = parse(await renderPage({ theme: 'wmh-portal', portalPalette: 'aggie', motionPaused: true, surface: 'app', children: <Page /> }))
    expect(doc.documentElement.dataset.portalPalette).toBe('aggie')
    expect(doc.documentElement.dataset.motion).toBe('paused')
    expect(doc.documentElement.dataset.scheme).toBe('light')
    expect(doc.body.dataset.surface).toBe('app')
  })

  it('stream mode awaits allReady: Suspense content is in the HTML, not its fallback', async () => {
    const html = await renderPage({
      theme: 'fleet',
      children: (
        <Suspense fallback={<p>Loading…</p>}>
          <Later promise={later('Final athlete list')} />
        </Suspense>
      ),
    })
    expect(html).toContain('Final athlete list')
    expect(html).not.toContain('Loading…')
  })

  it('renderPageStream resolves after allReady by default; can return the shell early', async () => {
    const slow = () => (
      <Suspense fallback={<p>Loading…</p>}>
        <Later promise={later('Done', 30)} />
      </Suspense>
    )
    const ready = await new Response(await renderPageStream({ theme: 'fleet', children: slow() })).text()
    expect(ready).toMatch(/^<!DOCTYPE html>/)
    expect(ready).toContain('Done')
    const early = await renderPageStream({ theme: 'fleet', children: slow(), waitForAllReady: false })
    expect(early).toBeInstanceOf(ReadableStream)
    await new Response(early).text()
  })

  it('string mode (build-time SSG) renders synchronously', async () => {
    const html = await renderPage({ theme: 'trident-studio', mode: 'string', seo: { title: 'Studio' }, children: <Page /> })
    expect(html).toContain('<title>Studio</title>')
  })

  it('only external module scripts: no inline executable JS anywhere', async () => {
    const html = await renderPage({
      theme: 'trident-nil',
      nonce: 'abc',
      scripts: ['/islands/entry.js'],
      seo: { title: 'FAQ', jsonLd: faqPage([{ question: 'Q?', answer: 'A.' }]) },
      children: <Island name="Toggle" component={({ on }: { on: boolean }) => <button type="button" aria-pressed={on}>Menu</button>} props={{ on: false }} />,
    })
    const doc = parse(html)
    const scripts = [...doc.querySelectorAll('script')]
    for (const s of scripts) {
      const type = s.getAttribute('type')
      if (type === 'module') {
        expect(s.getAttribute('src')).toBe('/islands/entry.js')
        expect(s.textContent).toBe('')
        expect(s.getAttribute('nonce')).toBe('abc')
      } else expect(['application/json', 'application/ld+json']).toContain(type)
    }
    expect(scripts).toHaveLength(3)
    expect(html).not.toMatch(/\son[a-z]+=/i)
  })

  it('caps font preloads at 2 (spec §4)', async () => {
    const html = await renderPage({ theme: 'fleet', preloadFonts: [{ href: '/fonts/inter.woff2' }], children: <Page /> })
    expect(html).toContain('<link rel="preload" as="font" type="font/woff2" href="/fonts/inter.woff2" crossorigin="anonymous"/>')
    await expect(renderPage({ theme: 'fleet', preloadFonts: [{ href: '/a' }, { href: '/b' }, { href: '/c' }] })).rejects.toThrow(/at most 2/)
  })

  it('legal surface: static markup, zero executable <script>, scripts option refused', async () => {
    const html = await renderPage({ theme: 'fleet', surface: 'legal', seo: { title: 'Terms' }, children: <main><h1>Terms</h1><p>Text</p></main> })
    expect(html).not.toContain('<!-- -->')
    expect(html).not.toMatch(/<script/)
    await expect(renderPage({ theme: 'fleet', surface: 'legal', scripts: ['/x.js'] })).rejects.toThrow(/zero <script>/)
    await expect(
      renderPage({ theme: 'fleet', surface: 'legal', children: <Island name="X" component={() => <b>x</b>} props={{}} /> }),
    ).resolves.toContain('application/json')
    await expect(renderPageStream({ theme: 'fleet', surface: 'legal' })).rejects.toThrow(/static markup/)
  })

  it('renderPageResponse: HTML content type, status, and noindex on auth/app/admin surfaces', async () => {
    const res = await renderPageResponse({ theme: 'fleet', surface: 'auth', children: <Page /> }, { status: 401 })
    expect(res.status).toBe(401)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
    expect(await res.text()).toContain('<h1>Deals</h1>')
    const marketing = await renderPageResponse({ theme: 'fleet', surface: 'marketing', children: <Page /> })
    expect(marketing.headers.get('x-robots-tag')).toBeNull()
    const legal = await renderPageResponse({ theme: 'fleet', surface: 'legal', children: <Page /> })
    expect(await legal.text()).not.toContain('<script')
  })

  it('rendered body passes axe under a theme × scheme', async () => {
    const doc = parse(await renderPage({ theme: 'wmh-portal', scheme: 'light', seo: { title: 'Portal' }, children: <Page /> }))
    document.documentElement.setAttribute('data-theme', 'wmh-portal')
    document.documentElement.setAttribute('data-scheme', 'light')
    document.body.innerHTML = doc.body.innerHTML
    expect(await axe(document.body)).toHaveNoViolations()
    document.body.innerHTML = ''
  })
})
