import { Fragment } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../a11y/internal'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** A single key. Ignored when `keys` is given. */
  children?: ReactNode
  /** A key combination, e.g. ["Ctrl", "K"]: rendered as nested <kbd> elements joined by "+". */
  keys?: string[]
}

/** Keyboard input. A combination uses nested <kbd> elements, as the HTML spec describes. */
export function Kbd({ keys, className, children, ...rest }: KbdProps) {
  if (!keys || keys.length === 0) {
    return (
      <kbd {...rest} className={cx('ui-kbd', className)}>
        {children}
      </kbd>
    )
  }
  return (
    <kbd {...rest} className={cx('ui-kbd-combo', className)}>
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i > 0 && <span className="ui-kbd-sep">+</span>}
          <kbd className="ui-kbd">{k}</kbd>
        </Fragment>
      ))}
    </kbd>
  )
}
