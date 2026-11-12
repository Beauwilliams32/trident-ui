import type { ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface TopBarProps {
  /** The start edge: a menu button on small screens, the page or workspace name. */
  start?: ReactNode
  /** The middle: a search field or a command-palette trigger. Takes the free space. */
  children?: ReactNode
  /** The end edge: help, notifications, the account menu. */
  end?: ReactNode
  className?: string
}

/** The bar across the top of an app screen (spec §7 P1 TopBar): three slots in one row, wrapping on a phone. */
export function TopBar({ start, children, end, className }: TopBarProps) {
  return (
    <header className={cx('ui-topbar', className)}>
      {start ? <div className="ui-topbar__start">{start}</div> : null}
      <div className="ui-topbar__middle">{children}</div>
      {end ? <div className="ui-topbar__end">{end}</div> : null}
    </header>
  )
}
