/**
 * <SeoHead>: title, description, canonical, robots, Open Graph, Twitter and JSON-LD for one page.
 * Render it inside <head> (renderPage() does this from its `seo` option). React 19 also hoists
 * <title>, <meta> and <link> to <head> if it is rendered elsewhere.
 *
 * JSON-LD goes in `<script type="application/ld+json">`: a data block the browser never executes,
 * so a `script-src 'self'` CSP needs no hash or nonce for it. The text is escaped with safeJson().
 */
import type { ReactElement } from 'react'
import { errorTitle } from '../forms/errorTitle'
import { type JsonLdThing, serializeJsonLd, type jsonLdGraph } from './jsonld'

export interface SeoImage {
  /** Absolute URL (crawlers do not resolve relative OG images reliably). */
  url: string
  /** Required: describes the image for share previews and screen readers. */
  alt: string
  width?: number
  height?: number
}

export interface SeoHeadProps {
  /** The full document title. */
  title: string
  /**
   * Errors on the page after a failed form POST. When it is above 0 the `<title>` gains the GOV.UK
   * "Error: " prefix (errorTitle()); share and Open Graph titles stay clean.
   */
  errorCount?: number
  description?: string
  /** Absolute canonical URL. Also used for og:url. */
  canonical?: string
  /**
   * Keep the page out of search results (auth, app, admin surfaces: spec §8).
   * Emits `noindex, nofollow` unless `robots` is also given.
   */
  noindex?: boolean
  /** Raw robots directive; overrides `noindex`. */
  robots?: string
  siteName?: string
  /** og:locale, e.g. `en_US`. */
  locale?: string
  /** og:type. Defaults to `website`. */
  type?: 'website' | 'article' | 'product' | 'profile'
  image?: SeoImage
  twitter?: { card?: 'summary' | 'summary_large_image'; site?: string; creator?: string }
  /** `<meta name="theme-color">`. */
  themeColor?: string
  /** hreflang alternates. */
  alternates?: ReadonlyArray<{ hrefLang: string; href: string }>
  /** One node, several nodes (each in its own block), or a `jsonLdGraph()`. */
  jsonLd?: JsonLdThing | JsonLdThing[] | ReturnType<typeof jsonLdGraph>
}

export function SeoHead(props: SeoHeadProps): ReactElement {
  const { title, description, canonical, siteName, locale, image, twitter, themeColor } = props
  const robots = props.robots ?? (props.noindex ? 'noindex, nofollow' : undefined)
  const blocks = props.jsonLd === undefined ? [] : Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd]
  const card = twitter?.card ?? (image ? 'summary_large_image' : 'summary')

  return (
    <>
      <title>{errorTitle(title, props.errorCount)}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {robots && <meta name="robots" content={robots} />}
      {themeColor && <meta name="theme-color" content={themeColor} />}
      {props.alternates?.map((alt) => <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />)}

      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={props.type ?? 'website'} />
      {canonical && <meta property="og:url" content={canonical} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      {locale && <meta property="og:locale" content={locale} />}
      {image && <meta property="og:image" content={image.url} />}
      {image && <meta property="og:image:alt" content={image.alt} />}
      {image?.width !== undefined && <meta property="og:image:width" content={String(image.width)} />}
      {image?.height !== undefined && <meta property="og:image:height" content={String(image.height)} />}

      <meta name="twitter:card" content={card} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image.url} />}
      {image && <meta name="twitter:image:alt" content={image.alt} />}
      {twitter?.site && <meta name="twitter:site" content={twitter.site} />}
      {twitter?.creator && <meta name="twitter:creator" content={twitter.creator} />}

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }} />
      ))}
    </>
  )
}
