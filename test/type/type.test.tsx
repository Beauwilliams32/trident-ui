/** type group: Heading, Text, Kicker, GradText, Mono, Code, Kbd, Prose (spec §4, §7). */
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Code, GradText, Heading, Kbd, Kicker, Mono, Prose, TEXT_SIZES, Text, checkHeadingOutline, countWords } from '../../src'
import { resetDevWarnings } from '../../src/a11y/internal'
import { examples } from '../../src/type/type.gallery'
import { THEME_SCHEMES } from '../a11y/themes'

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  resetDevWarnings()
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  warn.mockRestore()
  vi.unstubAllEnvs()
})

describe('Heading', () => {
  it('renders the element for its level with the default size for that level', () => {
    render(
      <>
        <Heading level={1}>One</Heading>
        <Heading level={2}>Two</Heading>
        <Heading level={3}>Three</Heading>
        <Heading level={4}>Four</Heading>
        <Heading level={5}>Five</Heading>
        <Heading level={6}>Six</Heading>
      </>,
    )
    const sizes = ['4xl', '3xl', '2xl', 'xl', 'lg', 'md']
    for (let l = 1; l <= 6; l++) {
      const h = screen.getByRole('heading', { level: l })
      expect(h.tagName).toBe(`H${l}`)
      expect(h.className).toBe(`ui-heading ui-fs-${sizes[l - 1]}`)
    }
    expect(warn).not.toHaveBeenCalled()
  })

  it('separates look from level with size and tone', () => {
    render(
      <Heading level={2} size="display" tone="muted" className="x">
        Big h2
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 2 }).className).toBe('ui-heading ui-fs-display ui-tone-muted x')
  })

  it('requires a level (type-level)', () => {
    // @ts-expect-error level is required
    const el = <Heading>No level</Heading>
    expect(el).toBeTruthy()
  })

  it('forwards refs', () => {
    const ref = { current: null as HTMLHeadingElement | null }
    render(
      <Heading level={1} ref={ref}>
        R
      </Heading>,
    )
    expect(ref.current?.tagName).toBe('H1')
  })

  it('warns in dev on a second h1', () => {
    render(
      <>
        <Heading level={1}>First</Heading>
        <Heading level={1}>Second</Heading>
      </>,
    )
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]![0])).toMatch(/h1 #2 \("Second"\)/)
  })

  it('warns in dev on a skipped level', () => {
    render(
      <>
        <Heading level={1}>Page</Heading>
        <Heading level={3}>Skipped</Heading>
      </>,
    )
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]![0])).toMatch(/h1 is followed by h3/)
  })

  it('does not warn for a well-formed outline or when stepping back up', () => {
    render(
      <>
        <Heading level={1}>Page</Heading>
        <Heading level={2}>A</Heading>
        <Heading level={3}>A.1</Heading>
        <Heading level={2}>B</Heading>
      </>,
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('stays silent in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    render(
      <>
        <Heading level={1}>A</Heading>
        <Heading level={1}>B</Heading>
      </>,
    )
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('checkHeadingOutline', () => {
  it('reports every extra h1 and skipped level, and allows a fragment to start at h2', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h2>a</h2><h3>b</h3><h1>c</h1><h1>d</h1><h4>e</h4><h2>f</h2>'
    const issues = checkHeadingOutline(root)
    expect(issues.map((i) => [i.kind, i.element.textContent])).toEqual([
      ['multiple-h1', 'd'],
      ['skipped-level', 'e'],
    ])
    expect(issues[1]!.previous).toBe(1)
  })
})

describe('Text', () => {
  it('is a base-size paragraph by default', () => {
    render(<Text>Body</Text>)
    const p = screen.getByText('Body')
    expect(p.tagName).toBe('P')
    expect(p.className).toBe('ui-text ui-fs-base')
  })

  it('supports as, size, tone, weight, measure and tabular', () => {
    render(
      <Text as="span" size="sm" tone="accent" weight="bold" measure tabular>
        42
      </Text>,
    )
    const el = screen.getByText('42')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toBe('ui-text ui-fs-sm ui-tone-accent ui-weight-bold ui-measure ui-tabular')
  })

  it('covers the whole spec §4 scale', () => {
    expect(TEXT_SIZES).toEqual(['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'display'])
  })
})

describe('Kicker', () => {
  it('is a paragraph with the accent tone by default, never a heading', () => {
    render(<Kicker>Trident Studio</Kicker>)
    const el = screen.getByText('Trident Studio')
    expect(el.tagName).toBe('P')
    expect(el.className).toBe('ui-kicker ui-kicker-accent')
    expect(screen.queryByRole('heading')).toBeNull()
  })
})

describe('GradText', () => {
  it('renders plain text in a span', () => {
    render(<GradText>whole fleet</GradText>)
    expect(screen.getByText('whole fleet').className).toBe('ui-grad-text')
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns in dev for more than two words', () => {
    render(<GradText>far too many words</GradText>)
    expect(warn).toHaveBeenCalledOnce()
  })

  it('counts words by whitespace', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('  one ')).toBe(1)
    expect(countWords('one\ttwo')).toBe(2)
    expect(countWords('a b c')).toBe(3)
  })
})

describe('Mono, Code, Kbd', () => {
  it('Mono is a span with the mono class', () => {
    render(<Mono>#A-1</Mono>)
    expect(screen.getByText('#A-1').className).toBe('ui-mono')
  })

  it('Code is inline <code> by default', () => {
    render(<Code>npm test</Code>)
    const el = screen.getByText('npm test')
    expect(el.tagName).toBe('CODE')
    expect(el.className).toBe('ui-code')
  })

  it('a Code block is a focusable, named, scrollable region', () => {
    render(
      <Code block label="Install">
        npm ci
      </Code>,
    )
    const region = screen.getByRole('region', { name: 'Install' })
    expect(region.tagName).toBe('PRE')
    expect(region.tabIndex).toBe(0)
    expect(region.firstElementChild?.tagName).toBe('CODE')
  })

  it('Kbd renders one key or a nested combination', () => {
    const { container } = render(
      <>
        <Kbd>Esc</Kbd>
        <Kbd keys={['Ctrl', 'K']} data-testid="combo" />
      </>,
    )
    expect(screen.getByText('Esc').className).toBe('ui-kbd')
    const combo = screen.getByTestId('combo')
    expect(combo.className).toBe('ui-kbd-combo')
    expect(Array.from(combo.querySelectorAll('kbd')).map((k) => k.textContent)).toEqual(['Ctrl', 'K'])
    expect(combo.textContent).toBe('Ctrl+K')
    expect(container.querySelectorAll('kbd')).toHaveLength(4)
  })
})

describe('Prose', () => {
  it('wraps long-form markup without changing it', () => {
    render(
      <Prose as="article">
        <h2>Terms</h2>
        <p>Body</p>
      </Prose>,
    )
    const art = screen.getByRole('article')
    expect(art.className).toBe('ui-prose')
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy()
  })
})

describe('type gallery × theme × scheme', () => {
  for (const [theme, scheme] of THEME_SCHEMES) {
    for (const ex of examples) {
      it(`${ex.id} passes axe in ${theme}/${scheme}`, async () => {
        const { container } = render(
          <main data-theme={theme} data-scheme={scheme}>
            {ex.render()}
          </main>,
        )
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
