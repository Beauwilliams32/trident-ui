import type { ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Heading } from '../type/Heading'
import { Text } from '../type/Text'

export interface PageHeaderProps {
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The trail above the title: pass `<Breadcrumbs>`. */
  breadcrumbs?: ReactNode
  /** Status next to the title: Badges or a StatusPill. Text plus colour. */
  meta?: ReactNode
  /** Page-level actions at the end: one primary Button, the rest secondary. */
  actions?: ReactNode
  /** The heading level. 1 for a page; 2 for a panel. Default 1. */
  level?: 1 | 2
  /** Below the title row: Tabs or a filter bar. */
  children?: ReactNode
  className?: string
}

/**
 * The top of an app page (spec §7 P1 PageHeader): breadcrumbs, the title with its status, a
 * description, and the page's actions, wrapping onto their own row on a phone. One h1 per page.
 */
export function PageHeader({ title, description, breadcrumbs, meta, actions, level = 1, children, className }: PageHeaderProps) {
  return (
    <header className={cx('ui-page-header', className)}>
      {breadcrumbs}
      <div className="ui-page-header__row">
        <div className="ui-page-header__text">
          <div className="ui-page-header__title">
            <Heading level={level} size={level === 1 ? '3xl' : '2xl'}>
              {title}
            </Heading>
            {meta ? <div className="ui-page-header__meta">{meta}</div> : null}
          </div>
          {description ? (
            <Text tone="muted" className="ui-page-header__description">
              {description}
            </Text>
          ) : null}
        </div>
        {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
      </div>
      {children}
    </header>
  )
}
