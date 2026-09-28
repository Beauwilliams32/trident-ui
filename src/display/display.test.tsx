import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import * as root from '../index'
import { Avatar, Badge, Card, Chip, StatCard, StatusPill, initialsOf } from './index'

function stubMatchMedia(matches: (q: string) => boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

afterEach(() => {
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-motion')
})

describe('root entry', () => {
  it('re-exports the display components', () => {
    for (const name of ['Badge', 'StatusPill', 'Chip', 'Avatar', 'Card', 'StatCard']) {
      expect(typeof (root as Record<string, unknown>)[name]).toBe('function')
    }
  })
})

describe('Badge', () => {
  it('renders text with a canonical tone, accepting portal aliases', async () => {
    const { container } = render(
      <p>
        <Badge tone="violet">Featured</Badge> <Badge tone="success" size="sm">Paid</Badge>
      </p>,
    )
    const [a, b] = container.querySelectorAll('.ui-badge')
    expect(a).toHaveProperty('textContent', 'Featured')
    expect(a!.getAttribute('data-tone')).toBe('accent')
    expect(b!.getAttribute('data-tone')).toBe('ok')
    expect(b!.getAttribute('data-size')).toBe('sm')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('passes through className, style and attributes', () => {
    render(
      <Badge className="x" style={{ marginLeft: 4 }} data-testid="b" title="t">
        1
      </Badge>,
    )
    const el = screen.getByTestId('b')
    expect(el.className).toBe('ui-badge ui-tone x')
    expect(el.style.marginLeft).toBe('4px')
  })

  it('hides the icon from assistive tech', () => {
    const { container } = render(<Badge icon={<svg />}>New</Badge>)
    expect(container.querySelector('.ui-badge__icon')!.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('StatusPill', () => {
  it('shows the default text for each status and a hidden dot', async () => {
    const { container } = render(
      <p>
        <StatusPill status="published" /> <StatusPill status="failed" /> <StatusPill status="reasoning" />
      </p>,
    )
    expect(container.textContent).toContain('Published')
    expect(container.textContent).toContain('Failed')
    const dots = container.querySelectorAll('.ui-status__dot')
    dots.forEach((d) => expect(d.getAttribute('aria-hidden')).toBe('true'))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('falls back to draft for unknown statuses (portal behaviour) and honours label', () => {
    const { container } = render(
      <p>
        <StatusPill status="mystery" /> <StatusPill status="scheduled" label="Tomorrow 9am" />
      </p>,
    )
    const [a, b] = container.querySelectorAll('.ui-status')
    expect(a!.getAttribute('data-status')).toBe('draft')
    expect(a!.textContent).toBe('Draft')
    expect(b!.textContent).toBe('Tomorrow 9am')
  })
})

describe('Chip', () => {
  it('is static text by default', () => {
    const { container } = render(<Chip>Austin</Chip>)
    expect(container.querySelector('button')).toBeNull()
    expect(container.textContent).toBe('Austin')
  })

  it('toggle chip is a button with aria-pressed', () => {
    const onClick = vi.fn()
    render(
      <Chip onClick={onClick} selected>
        Football
      </Chip>,
    )
    const btn = screen.getByRole('button', { name: 'Football' })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('type')).toBe('button')
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('remove button has a named label and is separate from the toggle', async () => {
    const onRemove = vi.fn()
    const onClick = vi.fn()
    const { container } = render(
      <div>
        <Chip onClick={onClick} onRemove={onRemove}>
          Texas
        </Chip>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove Texas' }))
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onClick).not.toHaveBeenCalled()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('uses removeLabel for non-string labels and disables both buttons', () => {
    render(
      <Chip onClick={() => {}} onRemove={() => {}} removeLabel="Remove filter" disabled>
        <b>Bold</b>
      </Chip>,
    )
    const remove = screen.getByRole('button', { name: 'Remove filter' }) as HTMLButtonElement
    expect(remove.disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Bold' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('Avatar', () => {
  it('computes initials', () => {
    expect(initialsOf('Beau Williams')).toBe('BW')
    expect(initialsOf('  cher ')).toBe('C')
    expect(initialsOf('Ada Byron Lovelace')).toBe('AB')
    expect(initialsOf('')).toBe('')
  })

  it('initials fallback is an img with the name as its label', async () => {
    const { container } = render(<Avatar name="Beau Williams" size="sm" />)
    const el = screen.getByRole('img', { name: 'Beau Williams' })
    expect(el.textContent).toBe('BW')
    expect(el.hasAttribute('data-fallback')).toBe(true)
    expect(el.style.getPropertyValue('--ui-avatar-size')).toBe('42px')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the image with alt text and falls back to initials on error', () => {
    const { container } = render(<Avatar name="Kula Karate" src="/k.png" shape="circle" size={40} />)
    const img = screen.getByRole('img', { name: 'Kula Karate' })
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('width')).toBe('40')
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Kula Karate' }).textContent).toBe('KK')
  })

  it('is hidden when decorative or nameless', () => {
    const { container } = render(
      <div>
        <Avatar name="Beau" decorative />
        <Avatar />
      </div>,
    )
    const avatars = container.querySelectorAll('.ui-avatar')
    avatars.forEach((a) => expect(a.getAttribute('aria-hidden')).toBe('true'))
    expect(avatars[1]!.textContent).toBe('?')
  })
})

describe('Card', () => {
  it('defaults to a solid div with md padding', () => {
    const { container } = render(<Card>Body</Card>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('data-variant')).toBe('solid')
    expect(el.getAttribute('data-padding')).toBe('md')
    expect(el.hasAttribute('data-interactive')).toBe(false)
  })

  it('supports glass, interactive (as prop or variant), accent and as', () => {
    const { container } = render(
      <div>
        <Card variant="glass" as="article">
          A
        </Card>
        <Card variant="interactive">B</Card>
        <Card interactive accent as="section" aria-label="C">
          C
        </Card>
      </div>,
    )
    const [a, b, c] = container.querySelectorAll('.ui-card')
    expect(a!.tagName).toBe('ARTICLE')
    expect(a!.getAttribute('data-variant')).toBe('glass')
    expect(b!.getAttribute('data-variant')).toBe('solid')
    expect(b!.hasAttribute('data-interactive')).toBe(true)
    expect(c!.hasAttribute('data-accent')).toBe(true)
  })

  it('accepts a CSS padding string (portal compatibility)', () => {
    const { container } = render(<Card padding="var(--space-4)">x</Card>)
    const el = container.firstElementChild as HTMLElement
    expect(el.hasAttribute('data-padding')).toBe(false)
    expect(el.style.padding).toBe('var(--space-4)')
  })

  describe('tilt (motion gate)', () => {
    function hover(el: HTMLElement) {
      el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) })
      fireEvent.pointerMove(el, { pointerType: 'mouse', clientX: 100, clientY: 0 })
    }

    it('tilts only when html.ui-motion is set, motion is allowed and the pointer is fine', () => {
      stubMatchMedia((q) => q.includes('hover: hover'))
      document.documentElement.classList.add('ui-motion')
      const onPointerMove = vi.fn()
      const { container } = render(
        <Card tilt onPointerMove={onPointerMove}>
          x
        </Card>,
      )
      const el = container.firstElementChild as HTMLElement
      hover(el)
      expect(onPointerMove).toHaveBeenCalledOnce()
      expect(el.style.getPropertyValue('--ui-tilt-y')).toBe('1.000')
      expect(el.style.getPropertyValue('--ui-tilt-x')).toBe('-1.000')
      fireEvent.pointerLeave(el)
      expect(el.style.getPropertyValue('--ui-tilt-y')).toBe('0.000')
    })

    it.each([
      ['reduced motion', () => stubMatchMedia((q) => q.includes('reduce') || q.includes('hover: hover')), true],
      ['paused', () => {
        stubMatchMedia((q) => q.includes('hover: hover'))
        document.documentElement.setAttribute('data-motion', 'paused')
      }, true],
      ['no html.ui-motion', () => stubMatchMedia((q) => q.includes('hover: hover')), false],
      ['coarse pointer', () => stubMatchMedia(() => false), true],
    ])('does nothing under %s', (_name, setup, withClass) => {
      setup()
      if (withClass) document.documentElement.classList.add('ui-motion')
      const { container } = render(<Card tilt>x</Card>)
      const el = container.firstElementChild as HTMLElement
      hover(el)
      expect(el.style.getPropertyValue('--ui-tilt-x')).toBe('')
    })
  })
})

describe('StatCard', () => {
  it('renders the final formatted value, label and trend with text', async () => {
    const { container } = render(<StatCard label="Posts" value={1284} trend={{ dir: 'up', value: '+12%', note: 'vs last week' }} />)
    const group = screen.getByRole('group', { name: 'Posts' })
    expect(group.querySelector('.ui-stat__value')!.textContent).toBe('1,284')
    const trend = group.querySelector('.ui-stat__trend')!
    expect(trend.textContent).toBe('Up +12%vs last week')
    expect(trend.getAttribute('data-tone')).toBe('ok')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders an honest empty state instead of a number', () => {
    render(<StatCard label="MRR" value={null} />)
    const v = screen.getByRole('group', { name: 'MRR' }).querySelector('.ui-stat__value')!
    expect(v.textContent).toBe('—No data')
    expect(v.hasAttribute('data-count-to')).toBe(false)
  })

  it('adds data-count-to only for opted-in finite numbers, keeping the final text', () => {
    const { container } = render(
      <div>
        <StatCard label="A" value={4200} countUp formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} />
        <StatCard label="B" value="2.1%" countUp />
        <StatCard label="C" value={Number.NaN} />
      </div>,
    )
    const vals = container.querySelectorAll('.ui-stat__value')
    expect(vals[0]!.textContent).toBe('$4,200')
    expect(vals[0]!.getAttribute('data-count-to')).toBe('4200')
    expect(vals[1]!.hasAttribute('data-count-to')).toBe(false)
    expect(vals[2]!.textContent).toBe('—No data')
  })

  it('down trend defaults to danger, tone overrides it, sub shows without a trend', () => {
    const { container } = render(
      <div>
        <StatCard label="A" value={1} trend={{ dir: 'down', value: '-3' }} />
        <StatCard label="B" value={1} trend={{ dir: 'down', value: '-3', tone: 'ok' }} />
        <StatCard label="C" value={1} sub="Stripe" />
      </div>,
    )
    const trends = container.querySelectorAll('.ui-stat__trend')
    expect(trends[0]!.getAttribute('data-tone')).toBe('danger')
    expect(trends[1]!.getAttribute('data-tone')).toBe('ok')
    expect(container.querySelector('.ui-stat__sub')!.textContent).toBe('Stripe')
  })
})
