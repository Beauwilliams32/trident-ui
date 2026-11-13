import { ReactElement, ReactNode, ComponentType } from 'react';
import { H as HydrateStrategy } from './protocol-DWCF29MR.js';

declare const SCHEMA_CONTEXT = "https://schema.org";
/** A schema.org node. `@context` is present on top-level nodes and stripped inside `jsonLdGraph()`. */
interface JsonLdThing {
    '@context'?: typeof SCHEMA_CONTEXT;
    '@type': string;
    [key: string]: unknown;
}
interface OrganizationInput {
    name: string;
    url: string;
    /** Absolute URL of a logo image (≥112×112 for Google). */
    logo?: string;
    description?: string;
    /** Profiles on other sites (absolute URLs). */
    sameAs?: string[];
    email?: string;
    telephone?: string;
    /** Stable node id, e.g. `https://example.com/#org`, so other nodes can reference it. */
    id?: string;
}
declare function organization(input: OrganizationInput): JsonLdThing;
interface WebSiteInput {
    name: string;
    url: string;
    description?: string;
    inLanguage?: string;
    /** `@id` of the publishing Organization (see `organization({ id })`). */
    publisherId?: string;
    /**
     * Site search URL containing the literal `{search_term_string}` placeholder, e.g.
     * `https://example.com/search?q={search_term_string}`. Only pass this if the search page exists.
     */
    searchUrlTemplate?: string;
}
declare function webSite(input: WebSiteInput): JsonLdThing;
interface FaqItem {
    question: string;
    /** Plain text, or the same HTML the page shows (schema.org allows basic inline HTML). */
    answer: string;
}
/** FAQPage JSON-LD. The questions and answers must match what the page visibly renders. */
declare function faqPage(items: readonly FaqItem[]): JsonLdThing;
interface BreadcrumbItem {
    name: string;
    /** Absolute URL. May be omitted only on the last crumb (the current page). */
    url?: string;
}
declare function breadcrumbList(items: readonly BreadcrumbItem[]): JsonLdThing;
type Availability = 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder' | 'SoldOut' | 'LimitedAvailability' | 'OnlineOnly' | 'InStoreOnly' | 'Discontinued';
interface OfferInput {
    /** The real price, from props or the pricing canon (spec §7 PricingTable). */
    price: number | string;
    /** ISO 4217, e.g. `USD`. */
    priceCurrency: string;
    availability?: Availability;
    url?: string;
    /** ISO 8601 date. */
    priceValidUntil?: string;
    sellerName?: string;
}
declare function offer(input: OfferInput): JsonLdThing;
interface ProductInput {
    name: string;
    description?: string;
    /** Absolute image URL(s). */
    image?: string | string[];
    sku?: string;
    brand?: string;
    url?: string;
    /** One offer or several (e.g. monthly and annual plans). Build each with `offer()` or pass its input. */
    offers: OfferInput | JsonLdThing | ReadonlyArray<OfferInput | JsonLdThing>;
}
/**
 * Product with Offer(s). **There is deliberately no rating or review input** (spec §7: no
 * aggregateRating). Passing one anyway, e.g. from untyped data, throws.
 */
declare function product(input: ProductInput): JsonLdThing;
/** Combines nodes into one `@graph` document with a single `@context`. */
declare function jsonLdGraph(...nodes: JsonLdThing[]): {
    '@context': typeof SCHEMA_CONTEXT;
    '@graph': JsonLdThing[];
};
/** Script-safe JSON text for a `<script type="application/ld+json">` block. */
declare function serializeJsonLd(data: JsonLdThing | JsonLdThing[] | ReturnType<typeof jsonLdGraph>): string;

/**
 * <SeoHead>: title, description, canonical, robots, Open Graph, Twitter and JSON-LD for one page.
 * Render it inside <head> (renderPage() does this from its `seo` option). React 19 also hoists
 * <title>, <meta> and <link> to <head> if it is rendered elsewhere.
 *
 * JSON-LD goes in `<script type="application/ld+json">`: a data block the browser never executes,
 * so a `script-src 'self'` CSP needs no hash or nonce for it. The text is escaped with safeJson().
 */

interface SeoImage {
    /** Absolute URL (crawlers do not resolve relative OG images reliably). */
    url: string;
    /** Required: describes the image for share previews and screen readers. */
    alt: string;
    width?: number;
    height?: number;
}
interface SeoHeadProps {
    /** The full document title. */
    title: string;
    /**
     * Errors on the page after a failed form POST. When it is above 0 the `<title>` gains the GOV.UK
     * "Error: " prefix (errorTitle()); share and Open Graph titles stay clean.
     */
    errorCount?: number;
    description?: string;
    /** Absolute canonical URL. Also used for og:url. */
    canonical?: string;
    /**
     * Keep the page out of search results (auth, app, admin surfaces: spec §8).
     * Emits `noindex, nofollow` unless `robots` is also given.
     */
    noindex?: boolean;
    /** Raw robots directive; overrides `noindex`. */
    robots?: string;
    siteName?: string;
    /** og:locale, e.g. `en_US`. */
    locale?: string;
    /** og:type. Defaults to `website`. */
    type?: 'website' | 'article' | 'product' | 'profile';
    image?: SeoImage;
    twitter?: {
        card?: 'summary' | 'summary_large_image';
        site?: string;
        creator?: string;
    };
    /** `<meta name="theme-color">`. */
    themeColor?: string;
    /** hreflang alternates. */
    alternates?: ReadonlyArray<{
        hrefLang: string;
        href: string;
    }>;
    /** One node, several nodes (each in its own block), or a `jsonLdGraph()`. */
    jsonLd?: JsonLdThing | JsonLdThing[] | ReturnType<typeof jsonLdGraph>;
}
declare function SeoHead(props: SeoHeadProps): ReactElement;

/**
 * Theme names and each theme's native scheme (spec §2.1, §3). Mirrors tokens.json `themes` plus the
 * `fleet` base; src/server/themes.test.ts fails if the two drift. Hard-coded rather than importing
 * tokens.json so the server entry stays small.
 */
declare const THEME_SCHEMES: {
    readonly fleet: "dark";
    readonly 'trident-ui': "dark";
    readonly 'trident-ui-light': "light";
    readonly 'trident-studio': "dark";
    readonly 'trident-nil': "dark";
    readonly 'trident-ops': "dark";
    readonly 'trident-playbook': "dark";
    readonly 'trident-tools': "dark";
    readonly 'trident-agents': "dark";
    readonly 'wmh-portal': "light";
    readonly 'wmh-marketing': "dark";
    readonly 'wmh-dark': "dark";
    readonly portfolio: "dark";
    readonly quorum: "dark";
};
type Scheme = 'dark' | 'light';
type ThemeName = keyof typeof THEME_SCHEMES;
declare function isThemeName(value: string): value is ThemeName;

/**
 * renderPage(): one full HTML document with theme selection done on the server (spec §2.1, §8).
 *
 * - `<html data-theme data-scheme>` is written server-side, so there is no flash of the wrong
 *   theme and no JS provider is needed for colour.
 * - Workers: `renderToReadableStream` from `react-dom/server.edge`, **awaiting `allReady`** by
 *   default so status and <head> are final on SEO routes. Build time: `mode: 'string'`.
 * - Legal surfaces render with `renderToStaticMarkup` and zero executable `<script>` (spec §8).
 * - No inline JS is ever emitted: scripts are external `type="module"` files (CSP `script-src 'self'`).
 */

/** Marks the page kind. `<Lazy3D>` refuses to mount under money/auth/legal/admin (spec §6.8). */
type Surface = 'marketing' | 'app' | 'money' | 'auth' | 'legal' | 'admin';
interface FontPreload {
    /** Same-origin woff2 URL, e.g. `/fonts/inter-latin-wght-normal.woff2`. */
    href: string;
    type?: string;
}
interface DocumentProps {
    /**
     * A package theme (see THEME_SCHEMES) or a client theme built on the token contract
     * (e.g. `kula`). Lowercase letters, digits and dashes.
     */
    theme: ThemeName | (string & {});
    /** Defaults to the package theme's native scheme; required for client themes. */
    scheme?: Scheme;
    lang?: string;
    dir?: 'ltr' | 'rtl';
    /** `data-portal-palette` on <html> (WMH per-client palettes, spec §2.1). */
    portalPalette?: string;
    /** `data-motion="paused"` when the visitor's Pause-motion choice is known server-side (spec §6.3-5). */
    motionPaused?: boolean;
    /** `data-surface` on <body>. */
    surface?: Surface;
    bodyClassName?: string;
    seo?: SeoHeadProps;
    /** Same-origin stylesheet URLs, in order (tokens.css, the theme, styles.css, the app's CSS). */
    stylesheets?: readonly string[];
    /** At most 2 font preloads per page (spec §4, §9). */
    preloadFonts?: readonly FontPreload[];
    /** External module scripts appended to <body> (islands entry, app bundle). Never inline. */
    scripts?: readonly string[];
    /** CSP nonce added to the module scripts, if the host uses nonces instead of `'self'`. */
    nonce?: string;
    /** Extra <head> content. */
    head?: ReactNode;
    /** The page body. */
    children?: ReactNode;
}
declare const MAX_FONT_PRELOADS = 2;
/**
 * The document tree renderPage() renders. Exported so an app that hydrates the whole document
 * (`hydrateRoot(document, <Document …/>)`) renders exactly the same tree on the client.
 */
declare function Document(props: DocumentProps): ReactElement;
type RenderMode = 'stream' | 'string' | 'static';
interface RenderPageOptions extends DocumentProps {
    /**
     * - `stream` (default): `renderToReadableStream` (react-dom/server.edge), awaiting `allReady`,
     *   so Suspense content is resolved in the output. Works in Workers and Node ≥20.
     * - `string`: `renderToString` (build-time SSG; Suspense boundaries render their fallback).
     * - `static`: `renderToStaticMarkup`, not hydratable. Forced for `surface: 'legal'`.
     */
    mode?: RenderMode;
    /** Aborts a streaming render. */
    signal?: AbortSignal;
    /** Errors React recovered from after the shell (e.g. a boundary that fell back to client render). */
    onError?: (error: unknown) => void;
}
/** Renders the full document to an HTML string (with `<!DOCTYPE html>`). */
declare function renderPage(options: RenderPageOptions): Promise<string>;
interface RenderPageStreamOptions extends RenderPageOptions {
    /** Wait for every Suspense boundary before returning (default true: SEO routes, spec §8). */
    waitForAllReady?: boolean;
}
/**
 * Streams the document with `renderToReadableStream`. By default resolves only after `allReady`,
 * so the caller can still pick the status code and every byte of <head> is final.
 * Legal pages cannot stream (they render static markup): use renderPage() for them.
 */
declare function renderPageStream(options: RenderPageStreamOptions): Promise<ReadableStream<Uint8Array>>;
/**
 * A Worker-ready `Response`: `text/html; charset=utf-8`, the given status (default 200) and headers.
 * Auth, app and admin surfaces also get `X-Robots-Tag: noindex` (spec §8), unless headers set it.
 */
declare function renderPageResponse(options: RenderPageStreamOptions, init?: ResponseInit): Promise<Response>;

/**
 * <Island>: server-renders an interactive component and writes its props as a JSON data block for
 * hydrateIslands() (spec §7, §8). No inline JS is emitted: the props travel in
 * `<script type="application/json">`, which browsers never execute, so `script-src 'self'` holds.
 *
 * The rest of the page stays static HTML; only islands hydrate, and only when their strategy fires.
 */

interface IslandProps<P extends object> {
    /** Registry key the client passes to hydrateIslands(), e.g. `MobileNav`. */
    name: string;
    /** The component. The client registry must map `name` to this same component. */
    component: ComponentType<P>;
    /** Plain JSON props. Anything that would not survive JSON (Dates, functions, Maps…) throws. */
    props: P;
    /** When to hydrate. Default `idle` (spec §8: React loads on idle or interaction). */
    hydrate?: HydrateStrategy;
    /** Wrapper element. Use `span` for an island inside phrasing content. */
    as?: 'div' | 'span' | 'section' | 'aside' | 'nav' | 'li';
    className?: string;
}
declare function Island<P extends object>(islandProps: IslandProps<P>): ReactElement;

/** JSON that is safe to place inside a `<script>` data block (JSON-LD, island props). */
/** A value that survives `JSON.stringify` → `JSON.parse` unchanged. */
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
/**
 * `JSON.stringify` with `<`, `>`, `&`, U+2028 and U+2029 escaped, so the text can never close the
 * surrounding `<script>` element or open an HTML comment. The result still parses to the same value.
 */
declare function safeJson(value: unknown): string;
/**
 * Throws a TypeError naming the path of the first value that would not round-trip through JSON
 * (functions, symbols, bigints, undefined, non-finite numbers, Dates, Maps, class instances).
 * Island props must round-trip exactly, or the client renders different markup from the server.
 */
declare function assertJsonSerializable(value: unknown, path?: string): asserts value is JsonValue;

export { type Availability, type BreadcrumbItem, Document, type DocumentProps, type FaqItem, type FontPreload, HydrateStrategy, Island, type IslandProps, type JsonLdThing, type JsonValue, MAX_FONT_PRELOADS, type OfferInput, type OrganizationInput, type ProductInput, type RenderMode, type RenderPageOptions, type RenderPageStreamOptions, SCHEMA_CONTEXT, type Scheme, SeoHead, type SeoHeadProps, type SeoImage, type Surface, THEME_SCHEMES, type ThemeName, type WebSiteInput, assertJsonSerializable, breadcrumbList, faqPage, isThemeName, jsonLdGraph, offer, organization, product, renderPage, renderPageResponse, renderPageStream, safeJson, serializeJsonLd, webSite };
