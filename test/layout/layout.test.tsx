/** layout group: Container, Stack, Cluster, Grid, Section (spec §5, §7). */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Cluster, Container, Grid, SPACE_STEPS, Section, Stack } from '../../src'
import { examples } from '../../src/layout/layout.gallery'
import { THEME_SCHEMES } from '../a11y/themes'

describe('Container', () => {
  it('defaults to the marketing width on a div', () => {
    render(<Container data-testid="c">x</Container>)
    const el = screen.getByTestId('c')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toBe('ui-container ui-container-marketing')
  })

  it('supports app, prose and full sizes and `as`', () => {
    render(
      <Container size="app" as="main" data-testid="c">
        x
      </Container>,
    )
    expect(screen.getByRole('main').className).toBe('ui-container ui-container-app')
  })
})

describe('Stack', () => {
  it('uses gap 4 and stretch by default, and never an inline style', () => {
    render(<Stack data-testid="s">x</Stack>)
    const el = screen.getByTestId('s')
    expect(el.className).toBe('ui-stack ui-gap-4 ui-align-stretch')
    expect(el.getAttribute('style')).toBeNull()
  })

  it('keeps list semantics with as="ul" and maps half steps', () => {
    render(
      <Stack as="ul" gap={0.5} align="center">
        <li>a</li>
        <li>b</li>
      </Stack>,
    )
    expect(screen.getByRole('list').className).toBe('ui-stack ui-gap-0-5 ui-align-center')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('Cluster', () => {
  it('wraps by default with gap 2, start, center', () => {
    render(<Cluster data-testid="c">x</Cluster>)
    expect(screen.getByTestId('c').className).toBe('ui-cluster ui-gap-2 ui-justify-start ui-align-center')
  })

  it('can disable wrapping and space between', () => {
    render(
      <Cluster data-testid="c" wrap={false} justify="between" align="baseline" gap={6}>
        x
      </Cluster>,
    )
    expect(screen.getByTestId('c').className).toBe('ui-cluster ui-gap-6 ui-justify-between ui-align-baseline ui-nowrap')
  })
})

describe('Grid', () => {
  it('is an auto-fit md grid by default', () => {
    render(<Grid data-testid="g">x</Grid>)
    expect(screen.getByTestId('g').className).toBe('ui-grid ui-gap-6 ui-grid-min-md')
  })

  it('fixed columns collapse on phones unless told not to', () => {
    render(
      <>
        <Grid data-testid="a" columns={3} />
        <Grid data-testid="b" columns={12} collapse={false} gap={2} />
      </>,
    )
    expect(screen.getByTestId('a').className).toBe('ui-grid ui-gap-6 ui-grid-cols-3 ui-grid-collapse')
    expect(screen.getByTestId('b').className).toBe('ui-grid ui-gap-2 ui-grid-cols-12')
  })
})

describe('Section', () => {
  it('renders a section with a marketing Container inside', () => {
    render(
      <Section aria-labelledby="h">
        <h2 id="h">Pricing</h2>
      </Section>,
    )
    const region = screen.getByRole('region', { name: 'Pricing' })
    expect(region.tagName).toBe('SECTION')
    expect(region.className).toBe('ui-section ui-section-md')
    expect(region.firstElementChild?.className).toBe('ui-container ui-container-marketing')
  })

  it('supports tone, space, no container and `as`', () => {
    render(
      <Section as="div" data-testid="s" tone="alt" space="lg" container={false}>
        <p>x</p>
      </Section>,
    )
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toBe('ui-section ui-section-lg ui-section-alt')
    expect(el.firstElementChild?.tagName).toBe('P')
  })
})

describe('spacing scale', () => {
  it('matches spec §5 (4px base)', () => {
    expect(SPACE_STEPS.map((s) => s * 4)).toEqual([0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128])
  })
})

describe('layout gallery × theme × scheme', () => {
  for (const [theme, scheme] of THEME_SCHEMES) {
    for (const ex of examples) {
      it(`${ex.id} passes axe in ${theme}/${scheme}`, async () => {
        const { container } = render(
          <div data-theme={theme} data-scheme={scheme}>
            {ex.render()}
          </div>,
        )
        expect(await axe(container)).toHaveNoViolations()
      })
    }
  }
})
