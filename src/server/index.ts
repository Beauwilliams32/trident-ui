/**
 * @trident/ui/server — SeoHead, JSON-LD builders, renderPage(), Island (spec §1, §7, §8).
 * Separate subpath entry: NOT re-exported from the package root, so server-only code never
 * lands in client bundles. Safe to import in Workers and Node: nothing touches `window` at import.
 */
export { SeoHead, type SeoHeadProps, type SeoImage } from './SeoHead'
export {
  SCHEMA_CONTEXT,
  type JsonLdThing,
  organization,
  type OrganizationInput,
  webSite,
  type WebSiteInput,
  faqPage,
  type FaqItem,
  breadcrumbList,
  type BreadcrumbItem,
  offer,
  type OfferInput,
  type Availability,
  product,
  type ProductInput,
  jsonLdGraph,
  serializeJsonLd,
} from './jsonld'
export {
  Document,
  type DocumentProps,
  type FontPreload,
  type Surface,
  renderPage,
  renderPageStream,
  renderPageResponse,
  type RenderMode,
  type RenderPageOptions,
  type RenderPageStreamOptions,
  MAX_FONT_PRELOADS,
} from './renderPage'
export { Island, type IslandProps } from './Island'
export { THEME_SCHEMES, type ThemeName, type Scheme, isThemeName } from './themes'
export { safeJson, assertJsonSerializable, type JsonValue } from './json'
export type { HydrateStrategy } from '../islands/protocol'
