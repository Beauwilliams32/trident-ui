import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  bindMotionToggle,
  bindTilt,
  countUp,
  countUpWhenVisible,
  formatNumber,
  initMotion,
  isCountable,
  lowPower,
  MOTION_STORAGE_KEY,
  observeReveal,
  parseNumber,
  paused,
  setMotionPaused,
  transition,
  unbindTilt,
} from './index'
import { _resetReveals } from './reveal'
import { FakeIntersectionObserver, installMotionStubs, installStorage, resetMotionDom, stubMatchMedia } from './test-helpers'

let stubs: ReturnType<typeof installMotionStubs>
let teardown: (() => void) | null = null

beforeEach(() => {
  resetMotionDom()
  _resetReveals()
  stubMatchMedia({})
  stubs = installMotionStubs()
})
afterEach(() => {
  teardown?.()
  teardown = null
  unbindTilt()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function el(html: string): HTMLElement {
  document.body.insertAdjacentHTML('beforeend', html)
  return document.body.lastElementChild as HTMLElement
}

describe('lowPower() — spec §0.2 thresholds', () => {
  it.each([
    [{}, false],
    [{ deviceMemory: 4, hardwareConcurrency: 4 }, false],
    [{ deviceMemory: 8, hardwareConcurrency: 8, connection: { effectiveType: '4g' } }, false],
    [{ deviceMemory: 3 }, true],
    [{ deviceMemory: 2 }, true],
    [{ hardwareConcurrency: 3 }, true],
    [{ connection: { saveData: true } }, true],
    [{ connection: { effectiveType: '2g' } }, true],
    [{ connection: { effectiveType: 'slow-2g' } }, true],
    [{ connection: { effectiveType: '3g' } }, false],
    [{ webkitConnection: { saveData: true } }, true],
  ])('%j -> %s', (nav, expected) => {
    expect(lowPower(nav)).toBe(expected)
  })
})

describe('isCountable / parseNumber / formatNumber', () => {
  it.each([
    ['1,500', true],
    ['$1,500/mo', true],
    ['98.6%', true],
    ['3.2×', true],
    ['12k+', true],
    ['2022-2023', false],
    ['1-800-555-0100', false],
    ['Top 3 of 10', false],
    ['Q4 2025', false],
    ['v2.1.3', false],
    ['', false],
    ['n/a', false],
  ])('%s -> %s', (text, expected) => {
    expect(isCountable(text)).toBe(expected)
  })

  it('honours explicit opt-in and opt-out', () => {
    expect(isCountable('Top 3 of 10', true)).toBe(true)
    expect(isCountable('1,500', false)).toBe(false)
    expect(isCountable('none', true)).toBe(false)
  })

  it('round-trips prefix, grouping, decimals and suffix', () => {
    const spec = parseNumber('$12,345.50/mo')!
    expect(spec).toMatchObject({ prefix: '$', value: 12345.5, decimals: 2, grouped: true, suffix: '/mo' })
    expect(formatNumber(spec.value, spec)).toBe('$12,345.50/mo')
    expect(formatNumber(0, spec)).toBe('$0.00/mo')
  })
})

describe.each([
  ['reduced motion', () => stubMatchMedia({ reduce: true, fine: true })],
  ['Pause', () => document.documentElement.setAttribute('data-motion', 'paused')],
])('%s: final state, no rAF, no observer', (_label, arrange) => {
  beforeEach(() => {
    stubMatchMedia({ fine: true })
    arrange()
  })

  it('countUp writes the final value synchronously', () => {
    const node = el('<strong>$1,500/mo</strong>')
    countUp(node)
    expect(node.textContent).toBe('$1,500/mo')
    expect(stubs.raf).not.toHaveBeenCalled()
  })

  it('countUpWhenVisible leaves the server value and creates no observer', () => {
    const node = el('<strong>12,400</strong>')
    countUpWhenVisible(node)
    expect(node.textContent).toBe('12,400')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('reveals immediately', () => {
    const a = el('<p data-reveal style="--i: 2">a</p>')
    teardown = initMotion()
    expect(a.hasAttribute('data-revealed')).toBe(true)
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('never binds tilt, so pointer moves start no rAF', () => {
    el('<div data-tilt>t</div>')
    expect(bindTilt()).toBe(false)
    document.body.firstElementChild!.dispatchEvent(new Event('pointermove', { bubbles: true }))
    expect(stubs.raf).not.toHaveBeenCalled()
  })

  it('skips view transitions and runs the update synchronously', () => {
    const start = vi.fn()
    ;(document as any).startViewTransition = start
    const update = vi.fn()
    expect(transition(update)).toBeNull()
    expect(update).toHaveBeenCalledOnce()
    expect(start).not.toHaveBeenCalled()
    delete (document as any).startViewTransition
  })

  it('initMotion counts nothing', () => {
    const n = el('<strong data-count-up>12,400</strong>')
    teardown = initMotion()
    expect(n.textContent).toBe('12,400')
    expect(stubs.raf).not.toHaveBeenCalled()
  })
})

describe('with motion allowed', () => {
  it('arms html.ui-motion and reveals on intersection', () => {
    const a = el('<p data-reveal>a</p>')
    teardown = initMotion()
    expect(document.documentElement.classList.contains('ui-motion')).toBe(true)
    expect(a.hasAttribute('data-revealed')).toBe(false)
    const io = FakeIntersectionObserver.observing(a)!
    io.enter(a)
    expect(a.hasAttribute('data-revealed')).toBe(true)
    expect(io.observed.has(a)).toBe(false)
  })

  it('picks up [data-reveal] nodes added later', async () => {
    teardown = initMotion()
    const b = el('<section><p data-reveal>late</p></section>').firstElementChild!
    await Promise.resolve()
    expect(FakeIntersectionObserver.observing(b)).toBeDefined()
  })

  it('observeReveal is idempotent', () => {
    const a = el('<p data-reveal>a</p>')
    observeReveal(a)
    observeReveal(a)
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
  })

  it('counts from 0 to the supplied value', () => {
    const node = el('<strong>1,500</strong>')
    countUp(node, { duration: 1000 })
    expect(node.textContent).toBe('0')
    stubs.pump(performance.now() + 500)
    expect(node.textContent).not.toBe('0')
    stubs.pump(performance.now() + 5000)
    expect(node.textContent).toBe('1,500')
  })

  it('never animates a date range or phone number', () => {
    const node = el('<span>2022-2023</span>')
    countUp(node)
    expect(node.textContent).toBe('2022-2023')
    expect(stubs.raf).not.toHaveBeenCalled()
  })

  it('pausing before a count-up is seen restores the final value', () => {
    const node = el('<strong>12,400</strong>')
    countUpWhenVisible(node)
    expect(node.textContent).toBe('0')
    setMotionPaused(true)
    expect(node.textContent).toBe('12,400')
  })

  it('pausing reveals everything at once', () => {
    const a = el('<p data-reveal>a</p>')
    teardown = initMotion()
    expect(a.hasAttribute('data-revealed')).toBe(false)
    setMotionPaused(true)
    expect(a.hasAttribute('data-revealed')).toBe(true)
  })

  it('binds tilt only for a fine pointer', () => {
    expect(bindTilt()).toBe(false)
    stubMatchMedia({ fine: true })
    expect(bindTilt()).toBe(true)
  })

  it('runs a view transition when supported and user-initiated', async () => {
    const finished = Promise.resolve()
    const start = vi.fn((cb: () => void) => {
      cb()
      return { ready: Promise.resolve(), finished }
    })
    ;(document as any).startViewTransition = start
    const update = vi.fn()
    transition(update, { name: 'tab' })
    expect(start).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
    expect(document.documentElement.getAttribute('data-vt')).toBe('tab')
    await finished
    await Promise.resolve()
    expect(document.documentElement.hasAttribute('data-vt')).toBe(false)
    delete (document as any).startViewTransition
  })
})

describe('Pause motion store', () => {
  it('sets html[data-motion=paused] and persists it', () => {
    setMotionPaused(true)
    expect(paused()).toBe(true)
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('paused')
    setMotionPaused(false)
    expect(document.documentElement.hasAttribute('data-motion')).toBe(false)
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('on')
  })

  it('survives storage that throws', () => {
    installStorage(true)
    expect(() => setMotionPaused(true)).not.toThrow()
    expect(paused()).toBe(true)
    expect(() => (teardown = initMotion())).not.toThrow()
  })

  it('initMotion restores the stored choice', () => {
    localStorage.setItem(MOTION_STORAGE_KEY, 'paused')
    teardown = initMotion()
    expect(paused()).toBe(true)
  })

  it('binds static [data-motion-toggle] buttons; the label stays fixed', () => {
    const b = el('<button type="button" data-motion-toggle aria-pressed="false">Pause motion</button>')
    teardown = initMotion()
    b.click()
    expect(paused()).toBe(true)
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(b.textContent).toBe('Pause motion')
    b.click()
    expect(paused()).toBe(false)
    expect(b.getAttribute('aria-pressed')).toBe('false')
  })

  it('one click toggles once even when bound twice', () => {
    const b = el('<button type="button" data-motion-toggle>Pause motion</button>')
    const u1 = bindMotionToggle(b)
    const u2 = bindMotionToggle(b)
    b.click()
    expect(paused()).toBe(true)
    u1()
    u2()
  })
})

describe('motion-lite CSS', () => {
  const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')
  it('uses no !important and animates only transform', () => {
    expect(css).not.toContain('!important')
    expect(css).not.toMatch(/transition:\s*(all|width|height|top|left)/)
  })
  it('flattens tilt under reduced motion and Pause', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain("html[data-motion='paused'] [data-tilt]")
  })
})
