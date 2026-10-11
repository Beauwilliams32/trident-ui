/**
 * @trident/ui/marketing (G6; spec §7 P1): the compositions Ops had to hand-build. Copy and prices
 * only ever come from props; the money surface carries no motion; FAQ JSON-LD matches the page.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { Zap } from 'lucide-react'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { LinkButton } from '../actions/Button'
import { MotionToggle as AppMotionToggle } from '../motion'
import { setMotionPaused } from '../motion-lite'
import { TextLink } from '../type/TextLink'
import { CtaBand, Faq, FeatureGrid, Hero, MotionToggle, PricingTable, SiteFooter, SiteHeader } from './index'
import * as root from '../index'

const css = readFileSync(join(import.meta.dirname, 'styles.css'), 'utf8')
const PLANS = [
  { id: 'starter', name: 'Starter', price: '$19', period: '/mo', blurb: 'For one location.', features: ['Scheduling'], cta: <LinkButton href="/signup?plan=starter">Start</LinkButton> },
  { id: 'pro', name: 'Pro', price: '$49', period: '/mo', highlight: true, features: ['Everything in Starter', 'Payroll export'], cta: <LinkButton href="/signup?plan=pro">Start</LinkButton> },
]

afterEach(() => {
  setMotionPaused(false)
  document.documentElement.removeAttribute('data-motion')
})

function Page() {
  return (
    <>
      <SiteHeader brand={<span>Trident Ops</span>} overlay>
        <TextLink href="#pricing" underline="hover">
          Pricing
        </TextLink>
      </SiteHeader>
      <main>
        <Hero title={<>Run the shop. <em>Not the spreadsheet.</em></>} kicker="Trident Ops" lede="Scheduling and payroll in one place." actions={<LinkButton href="#auth">Start free</LinkButton>} underNav />
        <FeatureGrid heading="What it does" headingHidden features={[{ icon: Zap, title: 'Fast', body: 'Opens in a second.' }]} />
        <PricingTable heading="Pricing" sub="Billed monthly." plans={PLANS} badge="Most popular" />
        <Faq heading="Questions" items={[{ q: 'Is there a contract?', a: 'No. Cancel any time.' }]} jsonLd />
        <CtaBand heading="Ready?" body="Set up takes ten minutes." action={<LinkButton href="#auth">Start free</LinkButton>} />
      </main>
      <SiteFooter note="© 2026 Trident Studio" motionToggle={<MotionToggle />}>
        <TextLink href="/privacy" underline="hover">
          Privacy
        </TextLink>
      </SiteFooter>
    </>
  )
}

describe('marketing entry', () => {
  it('is not part of the package root', () => {
    for (const name of ['Hero', 'FeatureGrid', 'PricingTable', 'Faq', 'CtaBand', 'SiteHeader', 'SiteFooter']) expect(root, name).not.toHaveProperty(name)
  })

  it('a composed landing page has one h1, named regions and no axe violations', async () => {
    const { container } = render(<Page />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Run the shop. Not the spreadsheet.')
    for (const name of ['What it does', 'Pricing', 'Questions', 'Ready?']) expect(screen.getByRole('region', { name })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeTruthy()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Hero', () => {
  it('renders the backdrop aria-hidden behind the copy and goes full height with it', () => {
    render(<Hero title="Title" backdrop={<div data-testid="bd" />} />)
    const hero = screen.getByRole('region', { name: 'Title' })
    expect(hero.hasAttribute('data-full')).toBe(true)
    expect(screen.getByTestId('bd').parentElement!.getAttribute('aria-hidden')).toBe('true')
  })

  it('without a backdrop it is not forced to full height', () => {
    render(<Hero title="Title" />)
    expect(screen.getByRole('region', { name: 'Title' }).hasAttribute('data-full')).toBe(false)
  })
})

describe('PricingTable (money surface)', () => {
  it('prints prices exactly as given, marks the highlight with text, and has no motion', () => {
    render(<PricingTable heading="Pricing" plans={PLANS} badge="Most popular" />)
    const region = screen.getByRole('region', { name: 'Pricing' })
    expect(region.getAttribute('data-surface')).toBe('money')
    expect(region.querySelector('[data-reveal]')).toBeNull()
    expect([...region.querySelectorAll('.ui-plan__price')].map((p) => p.textContent)).toEqual(['$19/mo', '$49/mo'])
    const pro = within(region).getByRole('heading', { name: 'Pro' }).closest('.ui-plan') as HTMLElement
    expect(within(pro).getByText('Most popular')).toBeTruthy()
    const starter = within(region).getByRole('heading', { name: 'Starter' }).closest('.ui-plan') as HTMLElement
    expect(within(starter).queryByText('Most popular')).toBeNull()
  })

  it('renders no price the caller did not supply', () => {
    const html = renderToStaticMarkup(<PricingTable heading="P" plans={[{ id: 'a', name: 'A', price: 'Free' }]} />)
    expect(html).toContain('Free')
    expect(html).not.toMatch(/\$\d/)
  })
})

describe('Faq', () => {
  it('uses <details> (no JS) and emits JSON-LD that matches the visible questions', () => {
    const html = renderToStaticMarkup(
      <Faq heading="Q" jsonLd items={[{ q: 'Is there a contract?', a: 'No. Cancel any time.' }, { q: 'Rich?', a: <strong>Yes</strong> }]} />,
    )
    expect(html.match(/<details/g)).toHaveLength(2)
    const json = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(html)![1]!)
    expect(json['@type']).toBe('FAQPage')
    expect(json.mainEntity).toEqual([{ '@type': 'Question', name: 'Is there a contract?', acceptedAnswer: { '@type': 'Answer', text: 'No. Cancel any time.' } }])
  })

  it('emits no JSON-LD unless asked', () => {
    expect(renderToStaticMarkup(<Faq heading="Q" items={[{ q: 'a', a: 'b' }]} />)).not.toContain('application/ld+json')
  })
})

describe('MotionToggle (no motion peer)', () => {
  it('renders the same markup as the /motion MotionToggle', () => {
    expect(renderToString(<MotionToggle />)).toBe(renderToString(<AppMotionToggle />))
  })

  it('toggles html[data-motion="paused"] and aria-pressed', () => {
    render(<MotionToggle />)
    const button = screen.getByRole('button', { name: 'Pause motion' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    act(() => fireEvent.click(button))
    expect(document.documentElement.getAttribute('data-motion')).toBe('paused')
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('marketing CSS', () => {
  it('has no animation of its own and only reads tokens', () => {
    expect(css).not.toMatch(/@keyframes|animation:|transition:/)
    expect(css).not.toMatch(/#[0-9a-f]{3,6}\b/i)
  })
})
