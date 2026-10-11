import { flushSync } from 'react-dom'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { transition } from '../motion-lite'

export interface ViewTransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  /**
   * Client-side navigation (your router's navigate). When given, a plain same-tab left click runs
   * it inside a View Transition; without it this is an ordinary link.
   */
  onNavigate?: (href: string) => void
  /** Written to html[data-vt] during the transition. */
  transitionName?: string
  /**
   * Drop the default `.ui-link` look (accent text, underline) when the link is styled by its
   * container, e.g. a tab or a nav item. Default false.
   */
  unstyled?: boolean
  children?: ReactNode
}

/**
 * A real `<a href>` (works without JS, opens in new tabs) that animates SPA route and tab changes
 * with document.startViewTransition. Skipped under reduced motion, Pause, or no browser support.
 */
export function ViewTransitionLink({ href, onNavigate, transitionName, unstyled = false, className, onClick, children, ...rest }: ViewTransitionLinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (!onNavigate || e.defaultPrevented) return
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (rest.target && rest.target !== '_self') return
    if (rest.download != null) return
    e.preventDefault()
    transition(() => onNavigate(href), { ...(transitionName ? { name: transitionName } : {}), flush: flushSync })
  }
  return (
    <a href={href} onClick={handle} {...rest} className={[unstyled ? null : 'ui-link', className].filter(Boolean).join(' ') || undefined}>
      {children}
    </a>
  )
}
