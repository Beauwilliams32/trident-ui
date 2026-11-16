import { ChevronRight } from 'lucide-react'
import { cx } from '../actions/internal'
import { breadcrumbList, serializeJsonLd } from '../server/jsonld'

export interface Crumb {
  label: string
  /** Where it goes. Omit on the last crumb: the current page is text, not a link. */
  href?: string
}

export interface BreadcrumbsProps {
  /** From the top of the site down to the current page; the last item is the current page. */
  items: ReadonlyArray<Crumb>
  /** Names the navigation landmark. Default "Breadcrumb". */
  label?: string
  /**
   * The site's origin ("https://example.com"). When given, a BreadcrumbList JSON-LD block is emitted
   * from the same items, with absolute URLs. Use it on public pages; leave it out in an app.
   */
  jsonLdBase?: string
  className?: string
}

/**
 * Where you are in the site (spec §7 P1 Breadcrumbs, plus JSON-LD): an ordered list of links ending
 * in the current page, marked `aria-current="page"`. Separators are decorative and hidden from
 * screen readers, and flip in right-to-left pages. Long trails wrap instead of truncating.
 */
export function Breadcrumbs({ items, label = 'Breadcrumb', jsonLdBase, className }: BreadcrumbsProps) {
  if (items.length === 0) return null
  const last = items.length - 1
  // Structured data needs a URL on every crumb but the last, so a text-only crumb in the middle is left out of it.
  const structured = jsonLdBase
    ? serializeJsonLd(
        breadcrumbList(
          items
            .filter((c, i) => i === last || c.href)
            .map((c, i, all) => ({ name: c.label, ...(c.href && i !== all.length - 1 ? { url: new URL(c.href, jsonLdBase).href } : {}) })),
        ),
      )
    : null
  return (
    <nav className={cx('ui-breadcrumbs', className)} aria-label={label}>
      <ol className="ui-breadcrumbs__list">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="ui-breadcrumbs__item">
            {i === last || !c.href ? (
              <span className="ui-breadcrumbs__current" aria-current={i === last ? 'page' : undefined}>
                {c.label}
              </span>
            ) : (
              <a className="ui-breadcrumbs__link" href={c.href}>
                {c.label}
              </a>
            )}
            {i === last ? null : <ChevronRight className="ui-breadcrumbs__sep" size={14} aria-hidden="true" />}
          </li>
        ))}
      </ol>
      {structured ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structured }} /> : null}
    </nav>
  )
}
