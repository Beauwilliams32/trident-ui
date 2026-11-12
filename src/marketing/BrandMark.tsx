import { useId, type ReactNode } from 'react'
import { DEPTH_LINE_CENTER, DEPTH_LINE_LEFT } from '../../brand/depth-line.mjs'
import { cx } from '../actions/internal'

export interface BrandMarkProps {
  /**
   * The gradient start. Default `var(--ui-accent-1)`, so the mark takes the current theme's accent;
   * pass a hex to pin a product's pair regardless of theme.
   */
  accent1?: string
  /** The gradient end. Default `var(--ui-accent-2)`. */
  accent2?: string
  /** Rendered size in px (the mark is square). Default 32. Check 16px before shipping a new pair. */
  size?: number
  /** Accessible name. Omit for a decorative mark beside a visible product name (aria-hidden). */
  title?: string
  className?: string
}

/**
 * The Depth Line fleet mark as a React component (spec §7 P1 BrandMark; brand/depth-line.mjs is the
 * vector source). The same three rails as `depthLineMark()`, with a gradient id from `useId` so
 * server and client markup agree and several marks can share a page.
 */
export function BrandMark({ accent1 = 'var(--ui-accent-1)', accent2 = 'var(--ui-accent-2)', size = 32, title, className }: BrandMarkProps) {
  const gradient = `${useId()}-depth-line`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cx('ui-brand-mark', className)}
      focusable="false"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={accent1} />
          <stop offset="1" stopColor={accent2} />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradient})`}>
        <path d={DEPTH_LINE_LEFT} />
        <path d={DEPTH_LINE_LEFT} transform="translate(64 0) scale(-1 1)" />
        <path d={DEPTH_LINE_CENTER} />
      </g>
    </svg>
  )
}

export interface BrandLockupProps extends BrandMarkProps {
  /** The product name as live text (never baked into an image): "Trident Ops". */
  name: ReactNode
  /** The small line above the name ("Trident Studio"), per the spec's kicker rule. */
  kicker?: ReactNode
}

/** The mark beside the product name, ready for `SiteHeader brand=`. The name stays real text. */
export function BrandLockup({ name, kicker, ...mark }: BrandLockupProps) {
  return (
    <span className="ui-brand-lockup">
      <BrandMark {...mark} />
      <span className="ui-brand-lockup__text">
        {kicker ? <span className="ui-brand-lockup__kicker">{kicker}</span> : null}
        <span className="ui-brand-lockup__name">{name}</span>
      </span>
    </span>
  )
}
