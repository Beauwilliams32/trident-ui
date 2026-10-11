import { useId, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Container } from '../layout/Container'
import { Heading } from '../type/Heading'
import { Kicker } from '../type/Kicker'
import { Text } from '../type/Text'

export interface HeroProps {
  /** Required text H1 (spec §7: a hero is never an image of text). `<em>` inside takes the accent. */
  title: ReactNode
  kicker?: ReactNode
  /** One or two sentences under the title. */
  lede?: ReactNode
  /** One primary and at most one secondary action (LinkButtons). */
  actions?: ReactNode
  /**
   * Full-bleed decorative layer behind the copy: a `<Lazy3D>` slot, a PosterFallback or a contour.
   * Rendered aria-hidden behind a scrim, so the copy stays legible. Never the LCP element.
   */
  backdrop?: ReactNode
  /**
   * An image beside the copy (the LCP candidate). Give its `<img>` width, height and
   * `fetchPriority="high"`, never `loading="lazy"` (spec §9).
   */
  media?: ReactNode
  /** Fill the first viewport (keeps a full-bleed backdrop out of LCP). Default true with a backdrop. */
  fullHeight?: boolean
  /** Leave room for an overlaid SiteHeader. */
  underNav?: boolean
  /**
   * The title's heading level. 1 on a landing page (spec §7: the hero carries the page's text H1);
   * lower only when the hero is embedded in another page, such as docs or this gallery.
   */
  level?: 1 | 2 | 3 | 4
  id?: string
  className?: string
  children?: ReactNode
}

/**
 * Marketing hero (spec §7 P1 Hero): a text H1, a lede, the actions, plus optional decorative
 * backdrop and media slots. No animation of its own; reveals are opt-in by the page.
 */
export function Hero({ title, kicker, lede, actions, backdrop, media, fullHeight, underNav = false, level = 1, id, className, children }: HeroProps) {
  const auto = useId()
  const headingId = id ? `${id}-heading` : `${auto}-heading`
  return (
    <section
      id={id}
      className={cx('ui-hero', className)}
      aria-labelledby={headingId}
      data-full={(fullHeight ?? Boolean(backdrop)) ? '' : undefined}
      data-under-nav={underNav ? '' : undefined}
      data-media={media ? '' : undefined}
    >
      {backdrop ? (
        <div className="ui-hero__backdrop" aria-hidden="true">
          {backdrop}
        </div>
      ) : null}
      <Container size="marketing" className="ui-hero__inner">
        <div className="ui-hero__copy">
          {kicker ? <Kicker>{kicker}</Kicker> : null}
          <Heading level={level} size="display" id={headingId} className="ui-hero__title">
            {title}
          </Heading>
          {lede ? (
            <Text size="md" tone="ink-2" className="ui-hero__lede">
              {lede}
            </Text>
          ) : null}
          {actions ? <div className="ui-hero__actions">{actions}</div> : null}
          {children}
        </div>
        {media ? <div className="ui-hero__media">{media}</div> : null}
      </Container>
    </section>
  )
}
