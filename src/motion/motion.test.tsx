import { act, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  AmbientGlow,
  CountUp,
  durations,
  easings,
  m,
  MotionRoot,
  MotionToggle,
  Reveal,
  springs,
  Tilt,
  ViewTransitionLink,
} from './index'
import { examples } from './motion.gallery'
import { examples as liteExamples } from '../motion-lite/motion-lite.gallery'
import { initMotion, MOTION_STORAGE_KEY, paused, unbindTilt } from '../motion-lite'
import { _resetReveals } from '../motion-lite/reveal'
import { FakeIntersectionObserver, installMotionStubs, resetMotionDom, stubMatchMedia } from '../motion-lite/test-helpers'
import tokens from '../../tokens.json'

let stubs: ReturnType<typeof installMotionStubs>
let teardown: (() => void) | null = null

beforeEach(() => {
  resetMotionDom()
  _resetReveals()
  stubMatchMedia({ fine: true })
  stubs = installMotionStubs()
})
afterEach(() => {
  teardown?.()
  teardown = null
  unbindTilt()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('presets mirror tokens.json (spec §6.2)', () => {
  it('springs', () => {
    for (const [name, v] of Object.entries(tokens.motion.spring)) {
      expect(springs[name as keyof typeof springs]).toEqual({ type: 'spring', ...v })
    }
  })
  it('durations in seconds', () => {
    for (const [name, ms] of Object.entries(tokens.motion.duration)) {
      expect(durations[name as keyof typeof durations] * 1000).toBeCloseTo(ms as number)
    }
  })
  it('easings', () => {
    expect(easings.ease).toEqual(tokens.motion.easing.ease)
    expect(easings.emph).toEqual(tokens.motion.easing.emph)
    expect(easings.exit).toEqual(tokens.motion.easing.exit)
    expect(easings.inout).toEqual(tokens.motion.easing.inout)
    expect(easings.spring).toEqual(tokens.motion.easing.spring)
    expect(easings.springPop).toEqual(tokens.motion.easing['spring-pop'])
  })
})

describe('MotionRoot', () => {
  it('renders m.* children under LazyMotion strict and arms html.ui-motion', () => {
    render(
      <MotionRoot>
        <m.p>hello</m.p>
      </MotionRoot>,
    )
    expect(screen.getByText('hello')).toBeTruthy()
    expect(document.documentElement.classList.contains('ui-motion')).toBe(true)
  })

  it('restores a stored Pause choice', () => {
    localStorage.setItem(MOTION_STORAGE_KEY, 'paused')
    render(<MotionRoot>x</MotionRoot>)
    expect(paused()).toBe(true)
  })
})

describe('SSR renders the final state', () => {
  it('Reveal, CountUp, MotionToggle', () => {
    const html = renderToString(
      <MotionRoot>
        <Reveal index={1}>shown</Reveal>
        <CountUp value="$1,500/mo" />
        <MotionToggle />
      </MotionRoot>,
    )
    expect(html).toContain('data-reveal=""')
    expect(html).toContain('--i:1')
    expect(html).toContain('$1,500/mo')
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('Pause motion')
  })
})

describe.each([
  ['reduced motion', () => stubMatchMedia({ reduce: true, fine: true })],
  ['Pause', () => document.documentElement.setAttribute('data-motion', 'paused')],
])('%s: final state rendered, no rAF started', (_label, arrange) => {
  beforeEach(() => arrange())

  it('Reveal shows at once without an observer', () => {
    render(<Reveal>content</Reveal>)
    expect(screen.getByText('content').hasAttribute('data-revealed')).toBe(true)
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('CountUp renders the final value', () => {
    const { container } = render(<CountUp value="12,400" />)
    expect(container.querySelector('.ui-count-digits')!.textContent).toBe('12,400')
    expect(stubs.raf).not.toHaveBeenCalled()
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('Tilt stays flat and schedules nothing', () => {
    render(<Tilt>card</Tilt>)
    fireEvent.pointerMove(screen.getByText('card'), { clientX: 10, clientY: 10 })
    expect(stubs.raf).not.toHaveBeenCalled()
  })

  it('ViewTransitionLink navigates without a view transition', () => {
    const start = vi.fn()
    ;(document as any).startViewTransition = start
    const nav = vi.fn()
    render(
      <ViewTransitionLink href="/next" onNavigate={nav}>
        Next
      </ViewTransitionLink>,
    )
    fireEvent.click(screen.getByText('Next'))
    expect(nav).toHaveBeenCalledWith('/next')
    expect(start).not.toHaveBeenCalled()
    delete (document as any).startViewTransition
  })
})

describe('with motion allowed', () => {
  it('Reveal waits for intersection', () => {
    render(<Reveal index={2}>later</Reveal>)
    const node = screen.getByText('later')
    expect(node.hasAttribute('data-revealed')).toBe(false)
    act(() => FakeIntersectionObserver.observing(node)!.enter(node))
    expect(node.hasAttribute('data-revealed')).toBe(true)
  })

  it('CountUp counts only to the value from props', () => {
    const { container } = render(<CountUp value="1,500" duration={1000} />)
    const digits = container.querySelector('.ui-count-digits')!
    expect(digits.textContent).toBe('0')
    expect(container.querySelector('.ui-visually-hidden')!.textContent).toBe('1,500')
    act(() => FakeIntersectionObserver.observing(digits)!.enter(digits))
    act(() => void stubs.pump(performance.now() + 5000))
    expect(digits.textContent).toBe('1,500')
  })

  it('CountUp renders non-quantities static (honesty guard)', () => {
    const { container } = render(<CountUp value="1-800-555-0100" />)
    expect(container.textContent).toBe('1-800-555-0100')
    expect(container.querySelector('[data-count]')).toBeNull()
  })

  it('ViewTransitionLink wraps navigation in a view transition, but not modified clicks', () => {
    const start = vi.fn((cb: () => void) => {
      cb()
      return { finished: Promise.resolve() }
    })
    ;(document as any).startViewTransition = start
    const nav = vi.fn()
    render(
      <ViewTransitionLink href="/next" onNavigate={nav} transitionName="page">
        Next
      </ViewTransitionLink>,
    )
    fireEvent.click(screen.getByText('Next'), { metaKey: true })
    expect(nav).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Next'))
    expect(start).toHaveBeenCalledOnce()
    expect(nav).toHaveBeenCalledWith('/next')
    delete (document as any).startViewTransition
  })

  it('ViewTransitionLink without onNavigate is a plain link', () => {
    render(<ViewTransitionLink href="/docs">Docs</ViewTransitionLink>)
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs')
  })
})

describe('MotionToggle', () => {
  it('pauses and resumes, persists, keeps its label', () => {
    render(<MotionToggle />)
    const button = screen.getByRole('button', { name: 'Pause motion' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(button)
    expect(paused()).toBe(true)
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('paused')
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Pause motion' })).toBe(button)
    fireEvent.click(button)
    expect(paused()).toBe(false)
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles once when initMotion() also bound it', () => {
    render(<MotionToggle />)
    teardown = initMotion()
    fireEvent.click(screen.getByRole('button'))
    expect(paused()).toBe(true)
  })
})

describe('AmbientGlow', () => {
  it('is decorative', () => {
    const { container } = render(<AmbientGlow tone="accent-2" />)
    const glow = container.firstElementChild!
    expect(glow.getAttribute('aria-hidden')).toBe('true')
    expect(glow.getAttribute('data-tone')).toBe('accent-2')
  })

  it('drift loop only without reduced motion and Pause; no !important', () => {
    const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html:not\(\[data-motion='paused'\]\) \.ui-ambient-glow\[data-drift\]/)
    expect(css).not.toContain('!important')
  })
})

describe('axe: every gallery example × theme × scheme', () => {
  const themes = ['trident-studio', 'wmh-portal', 'quorum']
  const schemes = ['dark', 'light']
  for (const theme of themes)
    for (const scheme of schemes)
      it(`${theme} / ${scheme}`, async () => {
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.setAttribute('data-scheme', scheme)
        const { container } = render(
          <main>
            <h1>Motion</h1>
            {[...examples, ...liteExamples].map((ex) => (
              <section key={ex.name} aria-label={ex.name}>
                {ex.render()}
              </section>
            ))}
          </main>,
        )
        expect(await axe(container)).toHaveNoViolations()
      })
})
