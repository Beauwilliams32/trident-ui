/**
 * Gallery examples for @trident/ui/marketing. Every string and price here is sample props: the
 * components author no copy, plans or prices of their own.
 */
import type { ReactNode } from 'react'
import { BarChart3, CalendarClock, ShieldCheck } from 'lucide-react'
import productTile from '../../brand/tile.svg'
import { LinkButton } from '../actions/Button'
import { PosterFallback } from '../three/PosterFallback'
import { TextLink } from '../type/TextLink'
import { CtaBand, Faq, FeatureGrid, Hero, MotionToggle, PricingTable, SiteFooter, SiteHeader } from './index'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  wide?: boolean
  render: () => ReactNode
}

export const group = 'marketing'

const Mark = () => <img src={productTile} width="28" height="28" alt="" />

export const examples: GalleryExample[] = [
  {
    id: 'site-header',
    title: 'SiteHeader',
    description: 'Brand lockup (mark plus live text) and the navigation. overlay lays it over a full-bleed hero.',
    wide: true,
    render: () => (
      <SiteHeader
        brand={
          <>
            <Mark />
            Sample product
          </>
        }
        brandHref="#site-header"
      >
        <TextLink href="#pricing-sample" underline="hover">
          Pricing
        </TextLink>
        <TextLink href="#faq-sample" underline="hover">
          FAQ
        </TextLink>
        <LinkButton href="#start" size="sm">
          Start free
        </LinkButton>
      </SiteHeader>
    ),
  },
  {
    id: 'hero',
    title: 'Hero',
    description: 'A text heading, one or two sentences and the actions, over an optional decorative backdrop (here the procedural poster).',
    wide: true,
    render: () => (
      <Hero
        level={4}
        fullHeight={false}
        kicker="Sample kicker"
        title={
          <>
            Plan the week. <em>Post on time.</em>
          </>
        }
        lede="A sample lede: one sentence about what the product does, passed in as a prop."
        actions={
          <>
            <LinkButton href="#start">Start free</LinkButton>
            <LinkButton href="#tour" variant="secondary">
              Take the tour
            </LinkButton>
          </>
        }
        backdrop={<PosterFallback />}
      />
    ),
  },
  {
    id: 'feature-grid',
    title: 'FeatureGrid',
    description: 'Three to six features as cards: an icon tile, a title and one sentence each. Reveals are opt-in and static without JS.',
    wide: true,
    render: () => (
      <FeatureGrid
        heading="Sample features"
        reveal={false}
        features={[
          { icon: CalendarClock, title: 'Schedule', body: 'A sample sentence about scheduling.' },
          { icon: BarChart3, title: 'Measure', body: 'A sample sentence about reporting.' },
          { icon: ShieldCheck, title: 'Approve', body: 'A sample sentence about approvals.' },
        ]}
      />
    ),
  },
  {
    id: 'pricing-table',
    title: 'PricingTable',
    description: 'Prices come only from props (your pricing canon). A money surface: no reveal, no 3D, the badge says why a plan is highlighted.',
    wide: true,
    render: () => (
      <PricingTable
        heading="Sample pricing (props only)"
        sub="These plans and prices are sample props, not an offer."
        badge="Recommended"
        plans={[
          { id: 'a', name: 'Sample A', price: '$19', period: '/month', blurb: 'One location.', features: ['Feature one', 'Feature two'], cta: <LinkButton href="#a" variant="secondary" fullWidth>Choose Sample A</LinkButton> },
          { id: 'b', name: 'Sample B', price: '$49', period: '/month', blurb: 'Several locations.', highlight: true, features: ['Everything in Sample A', 'Feature three'], cta: <LinkButton href="#b" fullWidth>Choose Sample B</LinkButton> },
        ]}
      />
    ),
  },
  {
    id: 'faq',
    title: 'Faq',
    description: 'Questions in <details>, so they open without JavaScript. jsonLd emits FAQPage structured data from the same items.',
    wide: true,
    render: () => (
      <Faq
        heading="Sample questions"
        reveal={false}
        jsonLd
        items={[
          { q: 'Is this a real question?', a: 'No. It is a sample prop showing how an answer reads.' },
          { q: 'Does the FAQ need JavaScript?', a: 'No. Each item is a native details element.' },
        ]}
      />
    ),
  },
  {
    id: 'cta-band',
    title: 'CtaBand',
    description: 'One closing call to action: a heading, one sentence and one button.',
    wide: true,
    render: () => <CtaBand heading="Sample call to action" body="One sentence that restates the offer, passed as a prop." action={<LinkButton href="#start">Start free</LinkButton>} reveal={false} />,
  },
  {
    id: 'site-footer',
    title: 'SiteFooter + MotionToggle',
    description: 'The legal line, footer links and the persistent Pause-motion control, which here needs no motion library.',
    wide: true,
    render: () => (
      <SiteFooter note="© 2026 Sample product" motionToggle={<MotionToggle />}>
        <TextLink href="#privacy" underline="hover">
          Privacy
        </TextLink>
        <TextLink href="#terms" underline="hover">
          Terms
        </TextLink>
      </SiteFooter>
    ),
  },
]

export default { group, examples }
