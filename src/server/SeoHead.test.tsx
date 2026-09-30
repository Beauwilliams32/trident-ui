import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { breadcrumbList, faqPage, jsonLdGraph, organization } from './jsonld'
import { SeoHead } from './SeoHead'

const html = (el: React.ReactElement) => renderToStaticMarkup(el)

describe('SeoHead', () => {
  it('renders title, description, canonical, Open Graph and Twitter tags', () => {
    const out = html(
      <SeoHead
        title="NIL deals | Trident NIL"
        description="Find athletes."
        canonical="https://nil.example/deals"
        siteName="Trident NIL"
        locale="en_US"
        image={{ url: 'https://nil.example/og.png', alt: 'Trident NIL crest', width: 1200, height: 630 }}
        twitter={{ site: '@trident' }}
        themeColor="#070d16"
        alternates={[{ hrefLang: 'es', href: 'https://nil.example/es/deals' }]}
      />,
    )
    expect(out).toContain('<title>NIL deals | Trident NIL</title>')
    expect(out).toContain('<meta name="description" content="Find athletes."/>')
    expect(out).toContain('<link rel="canonical" href="https://nil.example/deals"/>')
    expect(out).toContain('<meta property="og:url" content="https://nil.example/deals"/>')
    expect(out).toContain('<meta property="og:image:alt" content="Trident NIL crest"/>')
    expect(out).toContain('<meta property="og:image:width" content="1200"/>')
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image"/>')
    expect(out).toContain('<meta name="twitter:site" content="@trident"/>')
    expect(out).toContain('<link rel="alternate" hrefLang="es" href="https://nil.example/es/deals"/>')
    expect(out).toContain('<meta name="theme-color" content="#070d16"/>')
    expect(out).not.toContain('robots')
  })

  it('noindex emits a robots meta; an explicit robots string wins', () => {
    expect(html(<SeoHead title="Login" noindex />)).toContain('<meta name="robots" content="noindex, nofollow"/>')
    expect(html(<SeoHead title="Login" noindex robots="noindex" />)).toContain('<meta name="robots" content="noindex"/>')
  })

  it('writes each JSON-LD node in its own non-executable data block', () => {
    const out = html(<SeoHead title="FAQ" jsonLd={[faqPage([{ question: 'Q?', answer: 'A.' }]), breadcrumbList([{ name: 'Home' }])]} />)
    expect(out.match(/<script type="application\/ld\+json">/g)).toHaveLength(2)
    const graph = html(<SeoHead title="Home" jsonLd={jsonLdGraph(organization({ name: 'A', url: 'https://a.dev' }))} />)
    expect(graph.match(/<script/g)).toHaveLength(1)
  })

  it('escapes hostile JSON-LD text so it cannot break out of the script element', () => {
    const out = html(<SeoHead title="x" jsonLd={faqPage([{ question: '</script><img src=x onerror=alert(1)>', answer: 'a' }])} />)
    expect(out.match(/<\/script>/g)).toHaveLength(1)
    expect(out).not.toContain('<img')
  })
})
