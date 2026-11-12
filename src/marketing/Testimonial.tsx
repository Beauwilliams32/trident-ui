import type { ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface TestimonialProps {
  /** The quote, exactly as the person said it and agreed to publish. Never paraphrased or invented. */
  quote: ReactNode
  /** Who said it. */
  name: string
  /** Their role and organisation, as they gave permission to print them. */
  role?: string
  /** A small portrait or logo (an `<img>` with width, height and alt). */
  avatar?: ReactNode
  /** Where the quote was published, when it came from somewhere public. */
  source?: { href: string; label: string }
  className?: string
}

/**
 * One real quote with its attribution (spec §7 P1 Testimonial): a figure with a blockquote and a
 * caption. Real, permissioned quotes only. It emits no structured data of any kind, so it can never
 * produce an aggregateRating or Review; the quote text is plain content.
 */
export function Testimonial({ quote, name, role, avatar, source, className }: TestimonialProps) {
  return (
    <figure className={cx('ui-testimonial', className)}>
      <blockquote className="ui-testimonial__quote">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="ui-testimonial__who">
        {avatar ? <span className="ui-testimonial__avatar">{avatar}</span> : null}
        <span className="ui-testimonial__text">
          <strong>{name}</strong>
          {role ? <span>{role}</span> : null}
          {source ? (
            <a className="ui-link" href={source.href} rel="noopener noreferrer">
              {source.label}
            </a>
          ) : null}
        </span>
      </figcaption>
    </figure>
  )
}
