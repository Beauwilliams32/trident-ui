/**
 * schema.org JSON-LD builders (spec §7: SeoHead + jsonLd builders; FAQ uses FAQPage JSON-LD;
 * Breadcrumbs carry BreadcrumbList; Testimonial/Product never carry aggregateRating).
 *
 * Honesty rules (spec §6.3-9, §7):
 * - Builders only emit what the caller supplies. Nothing is defaulted into existence.
 * - `product()` has no rating or review input, and rejects `aggregateRating` / `review` at runtime,
 *   so a rating can never be fabricated through this API.
 * - Every URL must be absolute http(s); relative URLs are rejected rather than guessed.
 */
import { safeJson } from './json'

export const SCHEMA_CONTEXT = 'https://schema.org'

/** A schema.org node. `@context` is present on top-level nodes and stripped inside `jsonLdGraph()`. */
export interface JsonLdThing {
  '@context'?: typeof SCHEMA_CONTEXT
  '@type': string
  [key: string]: unknown
}

function absoluteUrl(value: string, field: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new TypeError(`${field} must be an absolute URL, got "${value}"`)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new TypeError(`${field} must be http(s), got "${value}"`)
  return url.href
}

function nonEmpty(value: string, field: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new TypeError(`${field} must not be empty`)
  return trimmed
}

/** Drops undefined keys and empty arrays so optional inputs never serialise as null/[]. */
function compact<T extends Record<string, unknown>>(node: T): T {
  for (const key of Object.keys(node)) {
    const v = node[key]
    if (v === undefined || (Array.isArray(v) && v.length === 0)) delete node[key]
  }
  return node
}

// ---------------------------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------------------------

export interface OrganizationInput {
  name: string
  url: string
  /** Absolute URL of a logo image (≥112×112 for Google). */
  logo?: string
  description?: string
  /** Profiles on other sites (absolute URLs). */
  sameAs?: string[]
  email?: string
  telephone?: string
  /** Stable node id, e.g. `https://example.com/#org`, so other nodes can reference it. */
  id?: string
}

export function organization(input: OrganizationInput): JsonLdThing {
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    '@id': input.id && absoluteUrl(input.id, 'organization.id'),
    name: nonEmpty(input.name, 'organization.name'),
    url: absoluteUrl(input.url, 'organization.url'),
    logo: input.logo && absoluteUrl(input.logo, 'organization.logo'),
    description: input.description,
    sameAs: input.sameAs?.map((u, i) => absoluteUrl(u, `organization.sameAs[${i}]`)),
    email: input.email,
    telephone: input.telephone,
  })
}

// ---------------------------------------------------------------------------------------------
// WebSite
// ---------------------------------------------------------------------------------------------

export interface WebSiteInput {
  name: string
  url: string
  description?: string
  inLanguage?: string
  /** `@id` of the publishing Organization (see `organization({ id })`). */
  publisherId?: string
  /**
   * Site search URL containing the literal `{search_term_string}` placeholder, e.g.
   * `https://example.com/search?q={search_term_string}`. Only pass this if the search page exists.
   */
  searchUrlTemplate?: string
}

export function webSite(input: WebSiteInput): JsonLdThing {
  let potentialAction: JsonLdThing | undefined
  if (input.searchUrlTemplate) {
    if (!input.searchUrlTemplate.includes('{search_term_string}')) {
      throw new TypeError('webSite.searchUrlTemplate must contain {search_term_string}')
    }
    absoluteUrl(input.searchUrlTemplate.replace('{search_term_string}', 'q'), 'webSite.searchUrlTemplate')
    potentialAction = {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: input.searchUrlTemplate },
      'query-input': 'required name=search_term_string',
    }
  }
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: nonEmpty(input.name, 'webSite.name'),
    url: absoluteUrl(input.url, 'webSite.url'),
    description: input.description,
    inLanguage: input.inLanguage,
    publisher: input.publisherId ? { '@id': absoluteUrl(input.publisherId, 'webSite.publisherId') } : undefined,
    potentialAction,
  })
}

// ---------------------------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------------------------

export interface FaqItem {
  question: string
  /** Plain text, or the same HTML the page shows (schema.org allows basic inline HTML). */
  answer: string
}

/** FAQPage JSON-LD. The questions and answers must match what the page visibly renders. */
export function faqPage(items: readonly FaqItem[]): JsonLdThing {
  if (items.length === 0) throw new TypeError('faqPage needs at least one question')
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item, i) => ({
      '@type': 'Question',
      name: nonEmpty(item.question, `faqPage[${i}].question`),
      acceptedAnswer: { '@type': 'Answer', text: nonEmpty(item.answer, `faqPage[${i}].answer`) },
    })),
  }
}

// ---------------------------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string
  /** Absolute URL. May be omitted only on the last crumb (the current page). */
  url?: string
}

export function breadcrumbList(items: readonly BreadcrumbItem[]): JsonLdThing {
  if (items.length === 0) throw new TypeError('breadcrumbList needs at least one item')
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => {
      const last = i === items.length - 1
      if (!item.url && !last) throw new TypeError(`breadcrumbList[${i}].url is required on every crumb but the last`)
      return compact({
        '@type': 'ListItem',
        position: i + 1,
        name: nonEmpty(item.name, `breadcrumbList[${i}].name`),
        item: item.url && absoluteUrl(item.url, `breadcrumbList[${i}].url`),
      })
    }),
  }
}

// ---------------------------------------------------------------------------------------------
// Product / Offer
// ---------------------------------------------------------------------------------------------

export type Availability =
  | 'InStock'
  | 'OutOfStock'
  | 'PreOrder'
  | 'BackOrder'
  | 'SoldOut'
  | 'LimitedAvailability'
  | 'OnlineOnly'
  | 'InStoreOnly'
  | 'Discontinued'

export interface OfferInput {
  /** The real price, from props or the pricing canon (spec §7 PricingTable). */
  price: number | string
  /** ISO 4217, e.g. `USD`. */
  priceCurrency: string
  availability?: Availability
  url?: string
  /** ISO 8601 date. */
  priceValidUntil?: string
  sellerName?: string
}

export function offer(input: OfferInput): JsonLdThing {
  const price = typeof input.price === 'string' ? Number(input.price) : input.price
  if (!Number.isFinite(price) || price < 0) throw new TypeError(`offer.price must be a non-negative number, got "${input.price}"`)
  if (!/^[A-Z]{3}$/.test(input.priceCurrency)) throw new TypeError(`offer.priceCurrency must be ISO 4217 (e.g. USD), got "${input.priceCurrency}"`)
  return compact({
    '@type': 'Offer',
    price: String(input.price).trim(),
    priceCurrency: input.priceCurrency,
    availability: input.availability && `${SCHEMA_CONTEXT}/${input.availability}`,
    url: input.url && absoluteUrl(input.url, 'offer.url'),
    priceValidUntil: input.priceValidUntil,
    seller: input.sellerName ? { '@type': 'Organization', name: input.sellerName } : undefined,
  })
}

export interface ProductInput {
  name: string
  description?: string
  /** Absolute image URL(s). */
  image?: string | string[]
  sku?: string
  brand?: string
  url?: string
  /** One offer or several (e.g. monthly and annual plans). Build each with `offer()` or pass its input. */
  offers: OfferInput | JsonLdThing | ReadonlyArray<OfferInput | JsonLdThing>
}

const FABRICATION_KEYS = ['aggregateRating', 'review', 'reviews', 'ratingValue'] as const

/**
 * Product with Offer(s). **There is deliberately no rating or review input** (spec §7: no
 * aggregateRating). Passing one anyway, e.g. from untyped data, throws.
 */
export function product(input: ProductInput): JsonLdThing {
  for (const key of FABRICATION_KEYS) {
    if (key in (input as unknown as Record<string, unknown>)) {
      throw new TypeError(`product.${key} is not accepted: ratings and reviews must never be fabricated (spec §7)`)
    }
  }
  const list = (Array.isArray(input.offers) ? input.offers : [input.offers]) as Array<OfferInput | JsonLdThing>
  if (list.length === 0) throw new TypeError('product.offers needs at least one offer')
  const offers = list.map((o) => ('@type' in o ? o : offer(o as OfferInput)))
  const images = input.image === undefined ? undefined : Array.isArray(input.image) ? input.image : [input.image]
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Product',
    name: nonEmpty(input.name, 'product.name'),
    description: input.description,
    image: images?.map((u, i) => absoluteUrl(u, `product.image[${i}]`)),
    sku: input.sku,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    url: input.url && absoluteUrl(input.url, 'product.url'),
    offers: offers.length === 1 ? offers[0] : offers,
  })
}

// ---------------------------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------------------------

/** Combines nodes into one `@graph` document with a single `@context`. */
export function jsonLdGraph(...nodes: JsonLdThing[]): { '@context': typeof SCHEMA_CONTEXT; '@graph': JsonLdThing[] } {
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': nodes.map((node) => {
      const copy: JsonLdThing = { ...node }
      delete copy['@context']
      return copy
    }),
  }
}

/** Script-safe JSON text for a `<script type="application/ld+json">` block. */
export function serializeJsonLd(data: JsonLdThing | JsonLdThing[] | ReturnType<typeof jsonLdGraph>): string {
  return safeJson(data)
}
