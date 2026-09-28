import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from './internal'

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default "span". */
  as?: ElementType
  children?: ReactNode
  ref?: Ref<HTMLElement>
}

/**
 * Content for assistive technology only: read by screen readers, invisible on screen.
 * If it contains a focusable element it becomes visible while focused (the class uses
 * `:not(:focus):not(:active)`), so keyboard users are never focused on something invisible.
 */
export function VisuallyHidden({ as: Comp = 'span', className, ...rest }: VisuallyHiddenProps) {
  return <Comp {...rest} className={cx('ui-visually-hidden', className)} />
}
