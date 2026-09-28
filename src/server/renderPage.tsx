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
import type { ReactElement, ReactNode } from 'react'
import { renderToReadableStream, renderToStaticMarkup, renderToString } from 'react-dom/server.edge'
import { SeoHead, type SeoHeadProps } from './SeoHead'
import { THEME_SCHEMES, type Scheme, type ThemeName, isThemeName } from './themes'

/** Marks the page kind. `<Lazy3D>` refuses to mount under money/auth/legal/admin (spec §6.8). */
export type Surface = 'marketing' | 'app' | 'money' | 'auth' | 'legal' | 'admin'

export interface FontPreload {
  /** Same-origin woff2 URL, e.g. `/fonts/inter-latin-wght-normal.woff2`. */
  href: string
  type?: string
}

export interface DocumentProps {
  /**
   * A package theme (see THEME_SCHEMES) or a client theme built on the token contract
   * (e.g. `kula`). Lowercase letters, digits and dashes.
   */
  theme: ThemeName | (string & {})
  /** Defaults to the package theme's native scheme; required for client themes. */
  scheme?: Scheme
  lang?: string
  dir?: 'ltr' | 'rtl'
  /** `data-portal-palette` on <html> (WMH per-client palettes, spec §2.1). */
  portalPalette?: string
  /** `data-motion="paused"` when the visitor's Pause-motion choice is known server-side (spec §6.3-5). */
  motionPaused?: boolean
  /** `data-surface` on <body>. */
  surface?: Surface
  bodyClassName?: string
  seo?: SeoHeadProps
  /** Same-origin stylesheet URLs, in order (tokens.css, the theme, styles.css, the app's CSS). */
  stylesheets?: readonly string[]
  /** At most 2 font preloads per page (spec §4, §9). */
  preloadFonts?: readonly FontPreload[]
  /** External module scripts appended to <body> (islands entry, app bundle). Never inline. */
  scripts?: readonly string[]
  /** CSP nonce added to the module scripts, if the host uses nonces instead of `'self'`. */
  nonce?: string
  /** Extra <head> content. */
  head?: ReactNode
  /** The page body. */
  children?: ReactNode
}

const THEME_PATTERN = /^[a-z][a-z0-9-]{0,63}$/
export const MAX_FONT_PRELOADS = 2

interface ResolvedDocument {
  theme: string
  scheme: Scheme
}

function resolve(props: DocumentProps): ResolvedDocument {
  const { theme } = props
  if (!THEME_PATTERN.test(theme)) throw new TypeError(`renderPage: invalid theme "${theme}"`)
  const scheme = props.scheme ?? (isThemeName(theme) ? THEME_SCHEMES[theme] : undefined)
  if (!scheme) throw new TypeError(`renderPage: theme "${theme}" is not a package theme, so pass scheme: 'dark' | 'light'`)
  if (scheme !== 'dark' && scheme !== 'light') throw new TypeError(`renderPage: invalid scheme "${String(scheme)}"`)
  if ((props.preloadFonts?.length ?? 0) > MAX_FONT_PRELOADS) {
    throw new RangeError(`renderPage: at most ${MAX_FONT_PRELOADS} font preloads per page (spec §4)`)
  }
  if (props.surface === 'legal' && props.scripts?.length) {
    throw new TypeError('renderPage: legal pages ship zero <script> (spec §8)')
  }
  return { theme, scheme }
}

/**
 * The document tree renderPage() renders. Exported so an app that hydrates the whole document
 * (`hydrateRoot(document, <Document …/>)`) renders exactly the same tree on the client.
 */
export function Document(props: DocumentProps): ReactElement {
  const { theme, scheme } = resolve(props)
  return (
    <html
      lang={props.lang ?? 'en'}
      dir={props.dir}
      data-theme={theme}
      data-scheme={scheme}
      data-portal-palette={props.portalPalette}
      data-motion={props.motionPaused ? 'paused' : undefined}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content={scheme} />
        {props.preloadFonts?.map((font) => (
          <link key={font.href} rel="preload" as="font" type={font.type ?? 'font/woff2'} href={font.href} crossOrigin="anonymous" />
        ))}
        {props.stylesheets?.map((href) => <link key={href} rel="stylesheet" href={href} />)}
        {props.seo && <SeoHead {...props.seo} />}
        {props.head}
      </head>
      <body data-surface={props.surface} className={props.bodyClassName}>
        {props.children}
        {props.scripts?.map((src) => <script key={src} type="module" src={src} nonce={props.nonce} />)}
      </body>
    </html>
  )
}

export type RenderMode = 'stream' | 'string' | 'static'

export interface RenderPageOptions extends DocumentProps {
  /**
   * - `stream` (default): `renderToReadableStream` (react-dom/server.edge), awaiting `allReady`,
   *   so Suspense content is resolved in the output. Works in Workers and Node ≥20.
   * - `string`: `renderToString` (build-time SSG; Suspense boundaries render their fallback).
   * - `static`: `renderToStaticMarkup`, not hydratable. Forced for `surface: 'legal'`.
   */
  mode?: RenderMode
  /** Aborts a streaming render. */
  signal?: AbortSignal
  /** Errors React recovered from after the shell (e.g. a boundary that fell back to client render). */
  onError?: (error: unknown) => void
}

const DOCTYPE = '<!DOCTYPE html>'
const EXECUTABLE_SCRIPT = /<script\b(?![^>]*\btype="application\/(?:ld\+)?json")[^>]*>/i

function withDoctype(html: string): string {
  return /^<!doctype html>/i.test(html) ? html : DOCTYPE + html
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let html = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    html += decoder.decode(value, { stream: true })
  }
  return html + decoder.decode()
}

function assertLegalOutput(html: string, surface: Surface | undefined): string {
  if (surface === 'legal' && EXECUTABLE_SCRIPT.test(html)) {
    throw new TypeError('renderPage: legal page output contains an executable <script> (spec §8)')
  }
  return html
}

/** Renders the full document to an HTML string (with `<!DOCTYPE html>`). */
export async function renderPage(options: RenderPageOptions): Promise<string> {
  const mode: RenderMode = options.surface === 'legal' ? 'static' : (options.mode ?? 'stream')
  const tree = <Document {...options} />
  if (mode === 'static') return assertLegalOutput(withDoctype(renderToStaticMarkup(tree)), options.surface)
  if (mode === 'string') return withDoctype(renderToString(tree))
  const stream = await renderPageStream(options)
  return withDoctype(await streamToString(stream))
}

export interface RenderPageStreamOptions extends RenderPageOptions {
  /** Wait for every Suspense boundary before returning (default true: SEO routes, spec §8). */
  waitForAllReady?: boolean
}

/**
 * Streams the document with `renderToReadableStream`. By default resolves only after `allReady`,
 * so the caller can still pick the status code and every byte of <head> is final.
 * Legal pages cannot stream (they render static markup): use renderPage() for them.
 */
export async function renderPageStream(options: RenderPageStreamOptions): Promise<ReadableStream<Uint8Array>> {
  if (options.surface === 'legal') throw new TypeError('renderPageStream: legal pages render static markup; use renderPage()')
  resolve(options)
  const stream = await renderToReadableStream(<Document {...options} />, {
    signal: options.signal,
    nonce: options.nonce,
    onError: options.onError,
  })
  if (options.waitForAllReady !== false) await stream.allReady
  return stream
}

/**
 * A Worker-ready `Response`: `text/html; charset=utf-8`, the given status (default 200) and headers.
 * Auth, app and admin surfaces also get `X-Robots-Tag: noindex` (spec §8), unless headers set it.
 */
export async function renderPageResponse(options: RenderPageStreamOptions, init: ResponseInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (!headers.has('content-type')) headers.set('content-type', 'text/html; charset=utf-8')
  if (options.surface && ['auth', 'app', 'admin'].includes(options.surface) && !headers.has('x-robots-tag')) {
    headers.set('x-robots-tag', 'noindex')
  }
  const body = options.surface === 'legal' ? await renderPage(options) : await renderPageStream(options)
  return new Response(body, { ...init, headers })
}
