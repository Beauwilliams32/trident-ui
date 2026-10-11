/**
 * Gallery examples for the server group (consumed by the integrator's gallery page).
 * Each example renders static, SSR-safe markup; nothing here touches `window` at import.
 * SeoHead and renderPage produce <head>/document output, so the gallery shows what they emit.
 */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CodeSample } from '../../gallery/CodeSample'
import { Island } from './Island'
import { breadcrumbList, faqPage, jsonLdGraph, offer, organization, product, serializeJsonLd, webSite } from './jsonld'
import { SeoHead } from './SeoHead'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactNode
}

/** Emitted markup in a code block with a copy button (G12: these were bare, minified <pre>s). */
function Output({ label, code }: { label: string; code: string }) {
  return (
    <figure className="g-figure">
      <figcaption>{label}</figcaption>
      <CodeSample label={label} code={code} language={label.includes('json') ? 'json' : 'html'} />
    </figure>
  )
}

/** JSON-LD as a reader wants it: the serialised (script-safe) text, parsed and indented. */
const pretty = (json: string) => JSON.stringify(JSON.parse(json), null, 2)

function StaticGreeting({ who }: { who: string }) {
  return <p>Server-rendered for {who}. Hydrates when idle.</p>
}

export const examples: GalleryExample[] = [
  {
    id: 'seo-head',
    title: 'SeoHead',
    description: 'Title, description, canonical, Open Graph, Twitter and JSON-LD for one page.',
    render: () => (
      <Output
        label="<head> output"
        code={renderToStaticMarkup(
          <SeoHead
            title="Deals | Trident NIL"
            description="Brand deals for college athletes."
            canonical="https://nil.example/deals"
            siteName="Trident NIL"
            image={{ url: 'https://nil.example/og/deals.png', alt: 'Trident NIL crest', width: 1200, height: 630 }}
            jsonLd={breadcrumbList([{ name: 'Home', url: 'https://nil.example/' }, { name: 'Deals' }])}
          />,
        ).replace(/></g, '>\n<')}
      />
    ),
  },
  {
    id: 'jsonld-graph',
    title: 'JSON-LD: Organization + WebSite',
    description: 'One @graph for the site: the organisation and the website that names it as publisher, linked by @id.',
    render: () => (
      <Output
        label="application/ld+json"
        code={JSON.stringify(
          jsonLdGraph(
            organization({ name: 'Trident Studio', url: 'https://tridentstudio.dev', id: 'https://tridentstudio.dev/#org' }),
            webSite({ name: 'Trident Studio', url: 'https://tridentstudio.dev', publisherId: 'https://tridentstudio.dev/#org' }),
          ),
          null,
          2,
        )}
      />
    ),
  },
  {
    id: 'jsonld-faq',
    title: 'JSON-LD: FAQPage',
    description: 'Questions and answers must match the visible FAQ.',
    render: () => <Output label="application/ld+json" code={pretty(serializeJsonLd(faqPage([{ question: 'Do I need an agent?', answer: 'No.' }])))} />,
  },
  {
    id: 'jsonld-product',
    title: 'JSON-LD: Product / Offer (no ratings)',
    description: 'Real prices only; aggregateRating and review are rejected.',
    render: () => (
      <Output
        label="application/ld+json"
        code={JSON.stringify(product({ name: 'Studio Pro', brand: 'Trident', offers: offer({ price: 29, priceCurrency: 'USD', availability: 'InStock' }) }), null, 2)}
      />
    ),
  },
  {
    id: 'island',
    title: 'Island',
    description: 'Server-rendered component plus a JSON props block. No inline JS.',
    render: () => <Island name="StaticGreeting" component={StaticGreeting} props={{ who: 'the gallery' }} />,
  },
]

export default examples
