import type { ReactNode } from 'react'
import studioGlyphInk from '../../brand/studio-glyph-ink.svg?no-inline'
import studioGlyphWhite from '../../brand/studio-glyph-white.svg?no-inline'
import { cx } from '../actions/internal'

export interface BrandMarkProps {
  /** The approved glyph's solid source color. Use `white` on dark surfaces. Default `ink`. */
  tone?: 'ink' | 'white'
  /** Rendered height in px; width follows the approved glyph's 2:3 aspect ratio. Default 32. */
  size?: number
  /** Accessible name. Omit for a decorative mark beside visible product text. */
  title?: string
  className?: string
}

/** The exact Trident Studio house glyph from the supplied, approved ink and white source assets. */
export function BrandMark({ tone = 'ink', size = 32, title, className }: BrandMarkProps) {
  return (
    <img
      src={tone === 'white' ? studioGlyphWhite : studioGlyphInk}
      width={size * 2 / 3}
      height={size}
      className={cx('ui-brand-mark', className)}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      draggable={false}
    />
  )
}

/** Semantic alias for surfaces that want to name the shared mark directly. */
export const TridentMark = BrandMark

export interface BrandLockupProps extends BrandMarkProps {
  /** The product name as live text (never baked into an image): "Trident Ops". */
  name: ReactNode
  /** The small line above the name ("Trident Studio"). */
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
