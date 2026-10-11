import type { ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Container } from '../layout/Container'

export interface SiteHeaderProps {
  /** The brand lockup: a mark plus the product name as live text (brand/README.md). */
  brand: ReactNode
  /** Where the brand links to. Default "/". */
  brandHref?: string
  /** Navigation and account actions (TextLinks, LinkButtons). */
  children?: ReactNode
  /** Accessible name of the navigation. Default "Main". */
  navLabel?: string
  /** Lay the header over the top of a full-bleed Hero instead of above it. */
  overlay?: boolean
  className?: string
}

/** The marketing header (spec §7 P1 SiteHeader): brand left, navigation and actions right. */
export function SiteHeader({ brand, brandHref = '/', children, navLabel = 'Main', overlay = false, className }: SiteHeaderProps) {
  return (
    <header className={cx('ui-site-header', className)} data-overlay={overlay ? '' : undefined}>
      <Container size="marketing" className="ui-site-header__inner">
        <a className="ui-site-header__brand" href={brandHref}>
          {brand}
        </a>
        {children ? (
          <nav className="ui-site-header__nav" aria-label={navLabel}>
            {children}
          </nav>
        ) : null}
      </Container>
    </header>
  )
}

export interface SiteFooterProps {
  /** The legal line, e.g. "© 2026 Trident Studio". */
  note?: ReactNode
  /** Footer links (TextLinks with underline="hover"). */
  children?: ReactNode
  /** The persistent Pause-motion control (spec §6.3 rule 5): pass <MotionToggle />. */
  motionToggle?: ReactNode
  navLabel?: string
  className?: string
}

/** The marketing footer (spec §7 P1 Footer, which includes the MotionToggle). */
export function SiteFooter({ note, children, motionToggle, navLabel = 'Footer', className }: SiteFooterProps) {
  return (
    <footer className={cx('ui-site-footer', className)}>
      <Container size="marketing" className="ui-site-footer__inner">
        {note ? <p className="ui-site-footer__note">{note}</p> : null}
        <div className="ui-site-footer__end">
          {children ? (
            <nav className="ui-site-footer__links" aria-label={navLabel}>
              {children}
            </nav>
          ) : null}
          {motionToggle}
        </div>
      </Container>
    </footer>
  )
}
