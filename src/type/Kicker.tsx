import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'

export interface KickerProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default "p". A kicker is never a heading. */
  as?: 'p' | 'span' | 'div'
  /** Default "accent" (--ui-accent-text; the portfolio theme swaps it for ink-2, see styles.css). */
  tone?: 'accent' | 'muted' | 'ink-2'
  ref?: Ref<HTMLElement>
}

/** Eyebrow label above a heading: 12px, 600, +0.14em, uppercase (spec §4). */
export function Kicker({ as = 'p', tone = 'accent', className, ...rest }: KickerProps) {
  const Comp = as as ElementType
  return <Comp {...rest} className={cx('ui-kicker', `ui-kicker-${tone}`, className)} />
}
