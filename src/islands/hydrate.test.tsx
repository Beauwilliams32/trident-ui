/**
 * SSR + hydration parity (spec §8, §10.4): render on the server with @trident/ui/server, hydrate in
 * jsdom with hydrateRoot / hydrateIslands, and FAIL on any onRecoverableError or hydration warning.
 */
import { act, useState } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Island } from '../server/Island'
import { renderPage } from '../server/renderPage'
import { hydrateIslands, type IslandRegistry, type IslandsHandle } from './index'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Counter({ label, start }: { label: string; start: number }) {
  const [n, setN] = useState(start)
  return (
    <button type="button" onClick={() => setN(n + 1)}>
      {label}: {n}
    </button>
  )
}

function Disclosure({ summary, items }: { summary: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls="disclosure-list" onClick={() => setOpen(!open)}>
        {summary}
      </button>
      <ul id="disclosure-list" hidden={!open}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function App({ user }: { user: string }) {
  const [count, setCount] = useState(0)
  return (
    <main>
      <h1>Hello {user}</h1>
      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </main>
  )
}

/** Recoverable errors + hydration console warnings. Any entry fails the parity tests. */
let recoverable: unknown[]
let hydrationWarnings: unknown[][]
const onRecoverableError = (error: unknown) => recoverable.push(error)
let handle: IslandsHandle | undefined

beforeEach(() => {
  recoverable = []
  hydrationWarnings = []
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (args.some((a) => /hydrat|did not match|server rendered/i.test(String(a)))) hydrationWarnings.push(args)
  })
})

afterEach(() => {
  act(() => handle?.dispose())
  handle = undefined
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.scheme
})

/** Server-renders a whole page, then installs its <html> attributes and <body> into the jsdom document. */
async function serve(children: React.ReactNode, theme = 'trident-nil', scheme: 'dark' | 'light' = 'dark') {
  const html = await renderPage({ theme, scheme, scripts: ['/islands.js'], seo: { title: 'Parity' }, children })
  const doc = new DOMParser().parseFromString(html, 'text/html')
  document.documentElement.dataset.theme = doc.documentElement.dataset.theme
  document.documentElement.dataset.scheme = doc.documentElement.dataset.scheme
  document.body.innerHTML = doc.body.innerHTML
  return html
}

const registry: IslandRegistry = { Counter, Disclosure }

function expectParity() {
  expect(recoverable, 'onRecoverableError fired: server and client markup differ').toEqual([])
  expect(hydrationWarnings, 'React logged a hydration warning').toEqual([])
}

const page = (
  <>
    <header>
      <Island name="Disclosure" component={Disclosure} props={{ summary: 'Menu', items: ['Deals', 'Athletes'] }} hydrate="load" as="nav" />
    </header>
    <main>
      <h1>Deals</h1>
      <p>Static copy stays static.</p>
      <Island name="Counter" component={Counter} props={{ label: 'Saved', start: 3 }} hydrate="load" />
    </main>
  </>
)

describe('SSR + hydration parity', () => {
  it('islands in a renderPage() document hydrate with zero recoverable errors and become interactive', async () => {
    await serve(page)
    await act(async () => {
      handle = hydrateIslands(registry, { onRecoverableError })
      await handle.ready
    })
    expectParity()
    expect(handle!.roots).toHaveLength(2)
    expect(document.querySelectorAll('[data-island-state="hydrated"]')).toHaveLength(2)

    const counter = document.querySelector('[data-island="Counter"] button') as HTMLButtonElement
    expect(counter.textContent).toBe('Saved: 3')
    act(() => counter.click())
    expect(counter.textContent).toBe('Saved: 4')

    const toggle = document.querySelector('[data-island="Disclosure"] button') as HTMLButtonElement
    act(() => toggle.click())
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('a full SSR app root hydrates with zero recoverable errors (hydrateRoot + onRecoverableError)', async () => {
    await serve(
      <div id="root">
        <App user="Beau" />
      </div>,
      'wmh-portal',
      'light',
    )
    const root = document.getElementById('root')!
    let reactRoot: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      reactRoot = hydrateRoot(root, <App user="Beau" />, { onRecoverableError })
    })
    expectParity()
    act(() => (root.querySelector('button') as HTMLButtonElement).click())
    expect(root.textContent).toContain('Clicked 1 times')
    act(() => reactRoot!.unmount())
  })

  it('negative control: a client/server difference IS caught by onRecoverableError', async () => {
    await serve(<Island name="Counter" component={Counter} props={{ label: 'Saved', start: 3 }} hydrate="load" />)
    function Different() {
      return <strong>Something else</strong>
    }
    await act(async () => {
      handle = hydrateIslands({ Counter: Different }, { onRecoverableError })
      await handle.ready
    })
    expect(recoverable.length).toBeGreaterThan(0)
  })

  it('hydrated islands pass axe under a theme × scheme', async () => {
    await serve(page, 'trident-ops', 'dark')
    await act(async () => {
      handle = hydrateIslands(registry, { onRecoverableError })
      await handle.ready
    })
    expectParity()
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('hydrateIslands strategies and errors', () => {
  it('idle: waits for idle time, then hydrates', async () => {
    await serve(<Island name="Counter" component={Counter} props={{ label: 'Idle', start: 0 }} hydrate="idle" />)
    handle = hydrateIslands(registry, { onRecoverableError })
    const el = document.querySelector('[data-island]')!
    expect(el.hasAttribute('data-island-state')).toBe(false)
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(el.getAttribute('data-island-state')).toBe('hydrated')
    expectParity()
  })

  it('visible: hydrates on first intersection', async () => {
    let callback: IntersectionObserverCallback | undefined
    const observe = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe = observe
        disconnect = vi.fn()
      },
    )
    await serve(<Island name="Counter" component={Counter} props={{ label: 'Seen', start: 0 }} hydrate="visible" />)
    handle = hydrateIslands(registry, { onRecoverableError })
    const el = document.querySelector('[data-island]')!
    expect(observe).toHaveBeenCalledWith(el)
    expect(el.hasAttribute('data-island-state')).toBe(false)
    await act(async () => {
      callback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(el.getAttribute('data-island-state')).toBe('hydrated')
    expectParity()
    vi.unstubAllGlobals()
  })

  it('interaction: hydrates on first pointer or focus, lazy loader supported', async () => {
    await serve(<Island name="LazyCounter" component={Counter} props={{ label: 'Lazy', start: 1 }} hydrate="interaction" />)
    const load = vi.fn(async () => Counter)
    handle = hydrateIslands({ LazyCounter: { load } }, { onRecoverableError })
    const el = document.querySelector('[data-island]')!
    await act(() => new Promise((r) => setTimeout(r, 10)))
    expect(load).not.toHaveBeenCalled()
    await act(async () => {
      el.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(el.getAttribute('data-island-state')).toBe('hydrated')
    expectParity()
  })

  it('reports unknown islands and bad props without throwing; other islands still hydrate', async () => {
    await serve(page)
    document.querySelector('[data-island="Disclosure"]')!.setAttribute('data-island', 'Missing')
    const onError = vi.fn()
    await act(async () => {
      handle = hydrateIslands({ Counter }, { onRecoverableError, onError })
      await handle.ready
    })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(String(onError.mock.calls[0]![0])).toMatch(/no island registered as "Missing"/)
    expect(document.querySelector('[data-island="Missing"]')!.getAttribute('data-island-state')).toBe('error')
    expect(handle!.roots).toHaveLength(1)
    expectParity()
  })

  it('does not look up inherited registry keys', async () => {
    document.body.innerHTML = '<div data-island="toString" data-island-hydrate="load"></div>'
    const onError = vi.fn()
    await act(async () => {
      handle = hydrateIslands({}, { onError })
      await handle.ready
    })
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('is idempotent: a second call does not re-hydrate; dispose unmounts', async () => {
    await serve(page)
    await act(async () => {
      handle = hydrateIslands(registry, { onRecoverableError })
      await handle.ready
    })
    let second: IslandsHandle | undefined
    await act(async () => {
      second = hydrateIslands(registry, { onRecoverableError })
      await second.ready
    })
    expect(second!.roots).toHaveLength(0)
    const unmount = vi.spyOn(handle!.roots[0]!, 'unmount')
    act(() => handle!.dispose())
    expect(unmount).toHaveBeenCalled()
    handle = undefined
    expectParity()
  })

  it('scopes to options.root', async () => {
    await serve(page)
    await act(async () => {
      handle = hydrateIslands(registry, { root: document.querySelector('main')!, onRecoverableError })
      await handle.ready
    })
    expect(handle!.roots).toHaveLength(1)
    expect(document.querySelector('[data-island="Disclosure"]')!.hasAttribute('data-island-state')).toBe(false)
  })
})
