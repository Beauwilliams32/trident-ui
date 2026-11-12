import { useId, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface SideNavProps {
  /** Names the navigation landmark ("Primary"). Required when the page has more than one navigation. */
  label: string
  children: ReactNode
  className?: string
}

/** The app's primary navigation (spec §7 P1 SideNav): a landmark holding a list of items and sections. */
export function SideNav({ label, children, className }: SideNavProps) {
  return (
    <nav className={cx('ui-sidenav', className)} aria-label={label}>
      <ul className="ui-sidenav__list">{children}</ul>
    </nav>
  )
}

export interface SideNavSectionProps {
  /** The group's heading ("Workspace"). */
  heading: string
  children: ReactNode
}

/** A titled group of SideNavItems; the heading names the group for screen readers. */
export function SideNavSection({ heading, children }: SideNavSectionProps) {
  const id = useId()
  return (
    <li className="ui-sidenav__section">
      <span id={id} className="ui-sidenav__heading">
        {heading}
      </span>
      <ul className="ui-sidenav__list" aria-labelledby={id}>
        {children}
      </ul>
    </li>
  )
}

export interface SideNavItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string
  /** The item's name. */
  children: ReactNode
  /** A lucide icon element (decorative). */
  icon?: ReactNode
  /** A count or status at the end: a Badge. Say what it means in the label if it matters ("Inbox, 3 new"). */
  badge?: ReactNode
  /** This is the page the person is on: `aria-current="page"` plus a bar and heavier text, never colour alone. */
  current?: boolean
}

/** One destination. A real link, so it works without JavaScript and opens in a new tab like any link. */
export function SideNavItem({ href, children, icon, badge, current = false, className, ...rest }: SideNavItemProps) {
  return (
    <li>
      <a {...rest} href={href} className={cx('ui-sidenav__item', className)} aria-current={current ? 'page' : undefined}>
        {icon ? (
          <span className="ui-sidenav__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="ui-sidenav__label">{children}</span>
        {badge ? <span className="ui-sidenav__badge">{badge}</span> : null}
      </a>
    </li>
  )
}
