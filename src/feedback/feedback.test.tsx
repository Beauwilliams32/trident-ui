import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import * as root from '../index'
import { Alert, FlashBanner, Toast, ToastRegion, flashTone } from './index'

describe('root entry', () => {
  it('re-exports the feedback components', () => {
    for (const name of ['Alert', 'FlashBanner', 'Toast', 'ToastRegion']) {
      expect(typeof (root as Record<string, unknown>)[name]).toBe('function')
    }
  })
})

describe('Alert', () => {
  it('uses role=status for non-errors and role=alert for errors', async () => {
    const { container } = render(
      <div>
        <Alert tone="success" title="Saved">
          Done.
        </Alert>
        <Alert tone="error">Declined.</Alert>
      </div>,
    )
    expect(screen.getByRole('status').getAttribute('data-tone')).toBe('ok')
    const alert = screen.getByRole('alert')
    expect(alert.getAttribute('data-tone')).toBe('danger')
    // Text, not colour alone: a hidden tone prefix when there is no title.
    expect(alert.textContent).toBe('Error: Declined.')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('live=false drops the role; an explicit role wins', () => {
    const { container } = render(
      <div>
        <Alert live={false}>Static</Alert>
        <Alert role="note">Note</Alert>
      </div>,
    )
    const [a, b] = container.querySelectorAll('.ui-alert')
    expect(a!.hasAttribute('role')).toBe(false)
    expect(b!.getAttribute('role')).toBe('note')
  })

  it('icon is aria-hidden, can be removed, and dismiss is a named button', () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <div>
        <Alert onDismiss={onDismiss} dismissLabel="Close notice">
          A
        </Alert>
        <Alert icon={false}>B</Alert>
      </div>,
    )
    const [a, b] = container.querySelectorAll('.ui-alert')
    expect(a!.querySelector('.ui-alert__icon')!.getAttribute('aria-hidden')).toBe('true')
    expect(b!.querySelector('.ui-alert__icon')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Close notice' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

describe('FlashBanner', () => {
  it('maps nil_flash types to tones', () => {
    expect(flashTone('success')).toBe('ok')
    expect(flashTone('error')).toBe('danger')
    expect(flashTone('warning')).toBe('warn')
    expect(flashTone('info')).toBe('info')
    expect(flashTone('notice')).toBe('info')
    expect(flashTone(undefined)).toBe('info')
    expect(flashTone('weird')).toBe('info')
  })

  it('renders nothing without a flash', () => {
    const { container } = render(
      <div>
        <FlashBanner flash={null} />
        <FlashBanner />
      </div>,
    )
    expect(container.querySelector('.ui-flash')).toBeNull()
  })

  it('renders a nil_flash as status and does not steal focus', async () => {
    const { container } = render(<FlashBanner flash={{ type: 'success', message: 'Profile saved.' }} id="flash-message" />)
    const el = screen.getByRole('status')
    expect(el.id).toBe('flash-message')
    expect(el.getAttribute('tabindex')).toBe('-1')
    expect(el.textContent).toBe('Success: Profile saved.')
    expect(document.activeElement).not.toBe(el)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('errors are role=alert and take focus by default', () => {
    render(<FlashBanner flash={{ type: 'error', message: 'Bad input.' }} />)
    const el = screen.getByRole('alert')
    expect(document.activeElement).toBe(el)
  })

  it('accepts tone + children and portal `tone` keys', () => {
    render(
      <div>
        <FlashBanner tone="warning">Careful.</FlashBanner>
        <FlashBanner flash={{ tone: 'info', message: 'FYI', title: 'Note' }} />
      </div>,
    )
    const statuses = screen.getAllByRole('status')
    expect(statuses[0]!.getAttribute('data-tone')).toBe('warn')
    expect(statuses[1]!.textContent).toBe('NoteFYI')
  })
})

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps the portal props: tone, title, message, onClose', async () => {
    vi.useRealTimers()
    const onClose = vi.fn()
    const { container } = render(
      <ToastRegion>
        <Toast title="Published" message="Posted." onClose={onClose} />
        <Toast tone="error" title="Failed" message="Too big." />
      </ToastRegion>,
    )
    expect(screen.getByRole('region', { name: 'Notifications' }).getAttribute('data-position')).toBe('top-right')
    const ok = screen.getByRole('status')
    expect(ok.getAttribute('data-tone')).toBe('ok')
    expect(screen.getByRole('alert').getAttribute('data-tone')).toBe('danger')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('auto-dismisses after duration (min 4s) and pauses on hover and focus', () => {
    const onClose = vi.fn()
    render(<Toast tone="info" message="Queued" onClose={onClose} duration={1000} />)
    const el = screen.getByRole('status')
    act(() => vi.advanceTimersByTime(3999))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseEnter(el)
    act(() => vi.advanceTimersByTime(10000))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseLeave(el)
    fireEvent.focus(screen.getByRole('button', { name: 'Dismiss' }))
    act(() => vi.advanceTimersByTime(10000))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.blur(screen.getByRole('button', { name: 'Dismiss' }))
    act(() => vi.advanceTimersByTime(4000))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('errors never auto-dismiss', () => {
    const onClose = vi.fn()
    render(<Toast tone="error" message="Failed" onClose={onClose} duration={4000} />)
    act(() => vi.advanceTimersByTime(60000))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('announces the tone as text when there is no title', () => {
    render(<Toast tone="warning" message="Two posts waiting." />)
    expect(screen.getByRole('status').textContent).toBe('Warning: Two posts waiting.')
  })
})
