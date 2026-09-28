import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from './internal'

export interface SkipLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** id of the main landmark to jump to (without '#'). Default "main". */
  targetId?: string
  /** Link text. Default "Skip to content". */
  children?: ReactNode
  ref?: Ref<HTMLAnchorElement>
}

/**
 * First focusable element on every page (WCAG 2.4.1). Off screen until it receives focus, then
 * shown top-left above the sticky nav. A plain anchor: works with no JavaScript.
 * Give the target `tabIndex={-1}` if it is not itself focusable, so focus moves with the jump.
 */
export function SkipLink({ targetId = 'main', children = 'Skip to content', className, ...rest }: SkipLinkProps) {
  return (
    <a {...rest} href={`#${targetId}`} className={cx('ui-skip-link', className)}>
      {children}
    </a>
  )
}
