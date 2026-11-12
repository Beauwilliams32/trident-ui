import { useId, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Section } from '../layout/Section'
import { Heading } from '../type/Heading'
import { Kicker } from '../type/Kicker'
import { Text } from '../type/Text'

export interface ShowcaseImage {
  /** The universally supported source (WebP or PNG). */
  src: string
  /** An AVIF source, offered first. */
  avif?: string
  width: number
  height: number
  /** Describes what the picture shows. Empty only for a purely decorative image. */
  alt: string
  /** A smaller crop for phones (640px and narrower). */
  mobile?: { src: string; avif?: string }
}

export interface ShowcaseMediaProps {
  heading: ReactNode
  kicker?: ReactNode
  /** One or two sentences above the media. */
  body?: ReactNode
  /** A picture. Below the fold by default: lazy, async decoded, with its size set so nothing shifts. */
  image?: ShowcaseImage
  /** Anything else (a video, an embed) in place of `image`. */
  media?: ReactNode
  /** The caption under the media. */
  caption?: ReactNode
  /**
   * A label pinned to the frame. Use it to say what the picture is: "Sample data" on a screenshot
   * that is not a real customer account. An honest label is the point of a product shot.
   */
  badge?: ReactNode
  /** Draw the window frame (three dots and a border) around the media. Default true. */
  framed?: boolean
  /** Load the image eagerly at high priority (only when it is the page's LCP element). Default false. */
  priority?: boolean
  id?: string
  tone?: 'default' | 'alt' | 'surface'
  className?: string
}

/**
 * A heading, a sentence and one piece of media in a frame (spec §7 P1 ShowcaseMedia): the product
 * screenshot or demo clip. Locally rendered screenshots only; label sample data as sample data.
 */
export function ShowcaseMedia({ heading, kicker, body, image, media, caption, badge, framed = true, priority = false, id, tone = 'default', className }: ShowcaseMediaProps) {
  const auto = useId()
  const headingId = `${id ?? auto}-heading`
  return (
    <Section id={id} space="lg" tone={tone} aria-labelledby={headingId} className={cx('ui-showcase', className)}>
      <div className="ui-marketing__head" data-align="center">
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <Heading level={2} size="3xl" id={headingId}>
          {heading}
        </Heading>
        {body ? <Text tone="muted">{body}</Text> : null}
      </div>
      <figure className="ui-showcase__figure">
        <div className="ui-showcase__frame" data-framed={framed ? '' : undefined}>
          {framed ? (
            <span className="ui-showcase__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : null}
          {badge ? <span className="ui-showcase__badge">{badge}</span> : null}
          {image ? (
            <picture>
              {image.mobile?.avif ? <source type="image/avif" media="(max-width: 640px)" srcSet={image.mobile.avif} /> : null}
              {image.mobile ? <source media="(max-width: 640px)" srcSet={image.mobile.src} /> : null}
              {image.avif ? <source type="image/avif" srcSet={image.avif} /> : null}
              <img
                className="ui-showcase__img"
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                {...(priority ? { fetchPriority: 'high' as const } : {})}
              />
            </picture>
          ) : (
            media
          )}
        </div>
        {caption ? <figcaption className="ui-showcase__caption">{caption}</figcaption> : null}
      </figure>
    </Section>
  )
}
