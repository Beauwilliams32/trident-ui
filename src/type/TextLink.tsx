import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from '../a11y/internal'

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Required: a TextLink is a real `<a href>` and navigates without JavaScript. */
  href: string
  children?: ReactNode
  /**
   * "always" (default) for links in running text: the underline means a link is never told apart
   * by colour alone (WCAG 1.4.1). "hover" only where position already says "link" (navigation
   * lists, footers): the underline then appears on hover and keyboard focus.
   */
  underline?: 'always' | 'hover'
  /**
   * "accent" (default) is `--ui-accent-text`, at least 4.5:1 on bg, bg-2 and surface in every theme.
   * "inherit" takes the surrounding text colour, for links inside toned surfaces (Alert, Toast).
   */
  tone?: 'accent' | 'inherit'
  /** Screen-reader hint appended when `target="_blank"`. Default "(opens in a new tab)". */
  newTabHint?: string
  ref?: Ref<HTMLAnchorElement>
}

/**
 * A themed inline link (G1; Radix Themes Link, shadcn's link styles). Package components that
 * contain links (Alert actions, Toast, FlashBanner, ViewTransitionLink) use the same `.ui-link`
 * rules, so no link in the system falls back to the browser's default blue.
 */
export function TextLink({ underline = 'always', tone = 'accent', newTabHint = '(opens in a new tab)', className, target, rel, children, ref, ...rest }: TextLinkProps) {
  const blank = target === '_blank'
  return (
    <a
      {...rest}
      ref={ref}
      target={target}
      rel={blank && rel === undefined ? 'noopener noreferrer' : rel}
      className={cx('ui-link', className)}
      data-underline={underline === 'hover' ? 'hover' : undefined}
      data-tone={tone === 'inherit' ? 'inherit' : undefined}
    >
      {children}
      {blank && newTabHint ? <span className="ui-visually-hidden">{` ${newTabHint}`}</span> : null}
    </a>
  )
}
