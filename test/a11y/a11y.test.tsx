/** a11y group: SkipLink, VisuallyHidden, LiveAnnouncer, FocusRing (spec §7, §9). */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { FocusRing, LiveAnnouncer, SkipLink, useAnnouncer, VisuallyHidden, focusRingClass, focusRingWithinClass } from '../../src'
import { resetDevWarnings } from '../../src/a11y/internal'
import { examples } from '../../src/a11y/a11y.gallery'
import { THEME_SCHEMES } from './themes'

describe('SkipLink', () => {
  it('links to #main by default with readable text', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link.getAttribute('href')).toBe('#main')
    expect(link.className).toContain('ui-skip-link')
  })

  it('accepts a target id, custom text and extra classes', () => {
    render(
      <SkipLink targetId="content" className="x">
        Skip to results
      </SkipLink>,
    )
    const link = screen.getByRole('link', { name: 'Skip to results' })
    expect(link.getAttribute('href')).toBe('#content')
    expect(link.className).toBe('ui-skip-link x')
  })

  it('passes axe as the first element of a page', async () => {
    const { container } = render(
      <div>
        <SkipLink />
        <main id="main" tabIndex={-1}>
          <h1>Page</h1>
        </main>
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('VisuallyHidden', () => {
  it('renders a span with the hidden class, still in the accessibility tree', () => {
    render(
      <button type="button">
        <span aria-hidden="true">✕</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
    expect(screen.getByText('Close').tagName).toBe('SPAN')
    expect(screen.getByText('Close').className).toBe('ui-visually-hidden')
  })

  it('renders another element with `as`', () => {
    render(<VisuallyHidden as="h2">Filters</VisuallyHidden>)
    expect(screen.getByRole('heading', { level: 2, name: 'Filters' })).toBeTruthy()
  })
})

describe('FocusRing', () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetDevWarnings()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => warn.mockRestore())

  it('adds the ring class to its child and keeps existing classes', () => {
    render(
      <FocusRing>
        <div tabIndex={0} className="card" data-testid="t">
          x
        </div>
      </FocusRing>,
    )
    expect(screen.getByTestId('t').className).toBe(`card ${focusRingClass}`)
  })

  it('supports focus-within and inset rings', () => {
    render(
      <FocusRing within inset>
        <div data-testid="t">
          <a href="#x">link</a>
        </div>
      </FocusRing>,
    )
    const el = screen.getByTestId('t')
    expect(el.className).toBe(focusRingWithinClass)
    expect(el.hasAttribute('data-focus-inset')).toBe(true)
  })

  it('warns in dev and renders a non-element child as-is', () => {
    render(<FocusRing>{'text' as never}</FocusRing>)
    expect(screen.getByText('text')).toBeTruthy()
    expect(warn).toHaveBeenCalledOnce()
  })
})

function Announcer({ message, politeness }: { message: string; politeness?: 'polite' | 'assertive' }) {
  const announce = useAnnouncer()
  return (
    <button type="button" onClick={() => announce(message, politeness)}>
      go
    </button>
  )
}

describe('LiveAnnouncer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const region = (p: 'polite' | 'assertive') => document.querySelector(`[data-ui-live="${p}"]`)!

  it('renders empty polite and assertive regions up front', () => {
    render(<LiveAnnouncer />)
    expect(region('polite').getAttribute('aria-live')).toBe('polite')
    expect(region('polite').getAttribute('aria-atomic')).toBe('true')
    expect(region('assertive').getAttribute('aria-live')).toBe('assertive')
    expect(region('polite').textContent).toBe('')
    expect(region('polite').className).toBe('ui-visually-hidden')
  })

  it('announces politely, repeats a repeated message, then clears', () => {
    render(
      <LiveAnnouncer clearAfter={1000}>
        <Announcer message="Saved" />
      </LiveAnnouncer>,
    )
    fireEvent.click(screen.getByRole('button'))
    act(() => void vi.advanceTimersByTime(60))
    expect(region('polite').textContent).toBe('Saved')
    fireEvent.click(screen.getByRole('button'))
    expect(region('polite').textContent).toBe('')
    act(() => void vi.advanceTimersByTime(60))
    expect(region('polite').textContent).toBe('Saved')
    act(() => void vi.advanceTimersByTime(1000))
    expect(region('polite').textContent).toBe('')
  })

  it('routes assertive messages to the assertive region', () => {
    render(
      <LiveAnnouncer>
        <Announcer message="Payment failed" politeness="assertive" />
      </LiveAnnouncer>,
    )
    fireEvent.click(screen.getByRole('button'))
    act(() => void vi.advanceTimersByTime(60))
    expect(region('assertive').textContent).toBe('Payment failed')
    expect(region('polite').textContent).toBe('')
  })

  it('is a warned no-op outside a LiveAnnouncer', () => {
    resetDevWarnings()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Announcer message="lost" />)
    fireEvent.click(screen.getByRole('button'))
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('clears pending timers on unmount', () => {
    const { unmount } = render(
      <LiveAnnouncer>
        <Announcer message="bye" />
      </LiveAnnouncer>,
    )
    fireEvent.click(screen.getByRole('button'))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('a11y gallery × theme × scheme', () => {
  for (const [theme, scheme] of THEME_SCHEMES) {
    for (const ex of examples) {
      it(`${ex.id} passes axe in ${theme}/${scheme}`, async () => {
        const { container } = render(
          <div data-theme={theme} data-scheme={scheme}>
            {ex.render()}
          </div>,
        )
        expect(container.querySelector(`[data-theme="${theme}"]`)).toBeTruthy()
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
