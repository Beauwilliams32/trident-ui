import { describe, expect, it } from 'vitest'
import { breadcrumbList, faqPage, jsonLdGraph, offer, organization, product, serializeJsonLd, webSite } from './jsonld'

describe('jsonLd builders', () => {
  it('organization: absolute URLs, optional fields omitted rather than null', () => {
    const org = organization({ name: 'Trident Studio', url: 'https://tridentstudio.dev', id: 'https://tridentstudio.dev/#org', sameAs: [] })
    expect(org).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://tridentstudio.dev/#org',
      name: 'Trident Studio',
      url: 'https://tridentstudio.dev/',
    })
    expect(() => organization({ name: 'X', url: '/relative' })).toThrow(/absolute URL/)
    expect(() => organization({ name: 'X', url: 'javascript:alert(1)' })).toThrow(/http/)
    expect(() => organization({ name: '  ', url: 'https://x.dev' })).toThrow(/empty/)
  })

  it('webSite: SearchAction only when a real search template is given', () => {
    expect(webSite({ name: 'Hub', url: 'https://x.dev' })).not.toHaveProperty('potentialAction')
    const site = webSite({ name: 'Hub', url: 'https://x.dev', searchUrlTemplate: 'https://x.dev/search?q={search_term_string}', publisherId: 'https://x.dev/#org' })
    expect(site.potentialAction).toMatchObject({ '@type': 'SearchAction', 'query-input': 'required name=search_term_string' })
    expect(site.publisher).toEqual({ '@id': 'https://x.dev/#org' })
    expect(() => webSite({ name: 'Hub', url: 'https://x.dev', searchUrlTemplate: 'https://x.dev/search' })).toThrow(/search_term_string/)
  })

  it('faqPage: Question/Answer pairs, rejects an empty list', () => {
    const faq = faqPage([{ question: 'Is it free?', answer: 'Yes.' }])
    expect(faq).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [{ '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } }],
    })
    expect(() => faqPage([])).toThrow()
  })

  it('breadcrumbList: 1-based positions, only the last crumb may omit its URL', () => {
    const list = breadcrumbList([{ name: 'Home', url: 'https://x.dev/' }, { name: 'Athletes', url: 'https://x.dev/athletes' }, { name: 'Jane' }])
    expect(list.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://x.dev/' },
      { '@type': 'ListItem', position: 2, name: 'Athletes', item: 'https://x.dev/athletes' },
      { '@type': 'ListItem', position: 3, name: 'Jane' },
    ])
    expect(() => breadcrumbList([{ name: 'Home' }, { name: 'Jane' }])).toThrow(/url is required/)
  })

  it('offer: validates price and ISO 4217 currency, expands availability', () => {
    expect(offer({ price: 49, priceCurrency: 'USD', availability: 'InStock' })).toEqual({
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })
    expect(() => offer({ price: -1, priceCurrency: 'USD' })).toThrow(/non-negative/)
    expect(() => offer({ price: 'free', priceCurrency: 'USD' })).toThrow()
    expect(() => offer({ price: 1, priceCurrency: 'usd' })).toThrow(/ISO 4217/)
  })

  it('product: offers only; never a rating or review (spec §7)', () => {
    const p = product({ name: 'Studio Pro', brand: 'Trident', offers: [{ price: '29.00', priceCurrency: 'USD' }, offer({ price: 290, priceCurrency: 'USD' })] })
    expect(p['@type']).toBe('Product')
    expect(p.brand).toEqual({ '@type': 'Brand', name: 'Trident' })
    expect(Array.isArray(p.offers)).toBe(true)
    expect(JSON.stringify(p)).not.toMatch(/rating|review/i)

    for (const key of ['aggregateRating', 'review', 'reviews', 'ratingValue']) {
      const bad = { name: 'X', offers: { price: 1, priceCurrency: 'USD' }, [key]: { ratingValue: 5, reviewCount: 999 } }
      expect(() => product(bad as never), key).toThrow(/never be fabricated/)
    }
    expect(() => product({ name: 'X', offers: [] })).toThrow(/at least one offer/)
  })

  it('jsonLdGraph keeps one @context', () => {
    const g = jsonLdGraph(organization({ name: 'A', url: 'https://a.dev' }), webSite({ name: 'A', url: 'https://a.dev' }))
    expect(g['@context']).toBe('https://schema.org')
    expect(g['@graph'].every((n) => !('@context' in n))).toBe(true)
  })

  it('serializeJsonLd cannot close its <script> element', () => {
    const text = serializeJsonLd(faqPage([{ question: '</script><script>alert(1)</script>', answer: 'a & b <!-- \u2028' }]))
    expect(text).not.toMatch(/[<>\u2028]/)
    expect(text).not.toContain('&')
    expect(JSON.parse(text).mainEntity[0].name).toBe('</script><script>alert(1)</script>')
  })
})
