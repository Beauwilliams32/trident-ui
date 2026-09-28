import { fireEvent, render, screen } from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports -- test-only: prove the markup works with no JS.
import { renderToStaticMarkup } from 'react-dom/server'
import { Plus, Settings } from 'lucide-react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HEX_RE, loadTokens, resolveTheme, themeVariants } from '../../scripts/lib/tokens.mjs'
import { contrastRatio, mix, parseHex, toHex } from '../utils/contrast'
import * as root from '../index'
import { BUTTON_HEIGHTS, Button, IconButton, LinkButton, buttonClassName, type ButtonSize, type ButtonVariant } from './index'
import { examples } from './actions.gallery'

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']

afterEach(() => vi.restoreAllMocks())

describe('Button', () => {
  it('is exported from the package root', () => {
    expect(root.Button).toBe(Button)
    expect(root.LinkButton).toBe(LinkButton)
    expect(root.IconButton).toBe(IconButton)
  })

  it.each(VARIANTS.flatMap((v) => SIZES.map((s) => [v, s] as const)))('%s / %s renders its classes', (variant, size) => {
    render(
      <Button variant={variant} size={size}>
        Go
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn.className).toBe(`ui-btn ui-btn--${variant} ui-btn--${size}`)
    expect(btn.getAttribute('type')).toBe('button')
  })

  it('sizes are 32 / 36 / 44 and match the component tokens', () => {
    expect(BUTTON_HEIGHTS).toEqual({ sm: 32, md: 36, lg: 44 })
    const c = loadTokens().component
    expect([c['btn-h-sm'], c['btn-h'], c['btn-h-lg']]).toEqual(['32px', '36px', '44px'])
  })

  it('renders a native submit button in static markup (no JS)', () => {
    const html = renderToStaticMarkup(
      <form method="post" action="/save">
        <Button type="submit" name="intent" value="save">
          Save
        </Button>
      </form>,
    )
    expect(html).toMatch(/^<form action="\/save" method="post"><button [^>]*type="submit"/)
    expect(html).toContain('class="ui-btn ui-btn--primary ui-btn--md"')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('aria-busy')
  })

  it('submits its form natively when clicked', () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault())
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent)}>
        <Button type="submit">Save</Button>
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('loading keeps the label in layout, sets busy/disabled state and swallows clicks', () => {
    const onClick = vi.fn()
    const onSubmit = vi.fn((e: Event) => e.preventDefault())
    const { container } = render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent)}>
        <Button type="submit" loading onClick={onClick}>
          Save changes
        </Button>
      </form>,
    )
    const btn = screen.getByRole('button', { name: 'Save changes' })
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(btn.getAttribute('aria-disabled')).toBe('true')
    expect(btn.hasAttribute('data-loading')).toBe(true)
    // Not natively disabled: it keeps focus and its submit value.
    expect((btn as HTMLButtonElement).disabled).toBe(false)
    // The label is still rendered (opacity 0 in CSS), so the width cannot change.
    expect(container.querySelector('.ui-btn__label')?.textContent).toBe('Save changes')
    expect(container.querySelector('.ui-btn__spinner svg')).not.toBeNull()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('loadingLabel replaces the accessible name while loading', () => {
    render(
      <Button loading loadingLabel="Saving…">
        Save
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeTruthy()
  })

  it('renders lucide icons as decorative', () => {
    const { container } = render(
      <Button icon={Plus} iconEnd={Plus}>
        Add
      </Button>,
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
    svgs.forEach((svg) => expect(svg.getAttribute('aria-hidden')).toBe('true'))
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy()
  })

  it('native disabled blocks clicks', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nope' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('buttonClassName matches for non-React templates', () => {
    expect(buttonClassName({ variant: 'ghost', size: 'lg', fullWidth: true, className: 'x' })).toBe('ui-btn ui-btn--ghost ui-btn--lg ui-btn--block x')
  })
})

describe('LinkButton', () => {
  it('is a real link', () => {
    render(<LinkButton href="/pricing">Pricing</LinkButton>)
    const a = screen.getByRole('link', { name: 'Pricing' })
    expect(a.getAttribute('href')).toBe('/pricing')
    expect(a.className).toContain('ui-btn--primary')
  })

  it('adds rel=noopener to new-tab links unless rel is given', () => {
    render(
      <>
        <LinkButton href="https://example.com" target="_blank">
          Ext
        </LinkButton>
        <LinkButton href="https://example.com" target="_blank" rel="me">
          Me
        </LinkButton>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Ext' }).getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByRole('link', { name: 'Me' }).getAttribute('rel')).toBe('me')
  })
})

describe('IconButton', () => {
  it('uses aria-label as its accessible name', () => {
    render(<IconButton icon={Settings} aria-label="Settings" />)
    const btn = screen.getByRole('button', { name: 'Settings' })
    expect(btn.className).toContain('ui-btn--icon')
    expect(btn.className).toContain('ui-btn--ghost')
    expect(btn.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('requires aria-label in the type and warns at runtime', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error aria-label is required
    render(<IconButton icon={Settings} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('IconButton requires a non-empty aria-label'))
  })
})

describe('actions a11y', () => {
  it.each(examples.map((e) => [e.id, e] as const))('gallery example %s passes axe', async (_id, example) => {
    const { container } = render(<main>{example.render()}</main>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each([
    ['trident-ops', 'dark'],
    ['wmh-portal', 'light'],
  ])('theme smoke: %s / %s', async (theme, scheme) => {
    const { container } = render(
      <div data-theme={theme} data-scheme={scheme}>
        <main>
          {VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
          <IconButton icon={Settings} aria-label="Settings" />
          <LinkButton href="#x">Link</LinkButton>
        </main>
      </div>,
    )
    expect(container.querySelector(`[data-theme="${theme}"] .ui-btn--primary`)).not.toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('gallery examples render with renderToStaticMarkup', () => {
    for (const e of examples) expect(renderToStaticMarkup(e.render())).toContain('ui-btn')
  })
})

describe('button colours pass §9 in every theme, including the pressed overlay', () => {
  // Worst case is the pressed overlay (10%, see styles.css).
  const PRESS = 0.1
  const inverse = (hex: string) => toHex(parseHex(hex).map((c) => 255 - c) as [number, number, number])
  const tokens = loadTokens()
  describe.each(themeVariants(tokens))('$id', ({ theme, palette }) => {
    const roles = resolveTheme(tokens, theme, palette) as Record<string, string>
    const opaque = (k: string) => {
      expect(roles[k], `${theme} ${k}`).toMatch(HEX_RE)
      return roles[k]!
    }
    it('primary: on-accent on accent-1 (overlay = inverse of on-accent) >= 4.5', () => {
      const onAccent = opaque('on-accent')
      const fill = opaque('accent-1')
      expect(contrastRatio(onAccent, fill)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(onAccent, mix(fill, inverse(onAccent), PRESS))).toBeGreaterThanOrEqual(4.5)
    })
    it.each(['bg', 'surface'])('ghost / secondary / danger / link text on pressed %s >= 4.5', (bgRole) => {
      const bg = opaque(bgRole)
      for (const fg of ['ink', 'danger']) {
        const ink = opaque(fg)
        expect(contrastRatio(ink, mix(bg, ink, PRESS)), `${fg} on ${bgRole}`).toBeGreaterThanOrEqual(4.5)
      }
      expect(contrastRatio(opaque('accent-text'), bg)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
