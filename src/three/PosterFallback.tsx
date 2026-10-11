import type { CSSProperties, ReactNode } from 'react'

export interface PosterFallbackProps {
  /** Fallback image (WebP or PNG). Rendered locally by `trident-ui poster`; owned assets only. */
  src?: string
  /** AVIF / WebP sources, tried before `src`. */
  avif?: string
  webp?: string
  /** 3D is decorative, so the poster is too: empty alt by default. Pass alt text only if it carries meaning. */
  alt?: string
  width?: number
  height?: number
  /** Eager-load when the poster is above the fold. Never the LCP element (spec §6.7). */
  eager?: boolean
  /**
   * The image's `loading` attribute. Overrides `eager` when given (`eager` stays for compatibility).
   */
  loading?: 'eager' | 'lazy'
  /**
   * The image's fetch priority. Pass "low" for an above-the-fold decorative backdrop so it never
   * competes with the CSS and fonts that paint a text H1 (the Ops landing hero).
   */
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
  style?: CSSProperties
  /** Custom poster markup instead of an image. */
  children?: ReactNode
}

/**
 * The poster that paints first and stays whenever 3D does not mount (spec §6.5). With no image it
 * paints a procedural token gradient, so it is never empty. SSR-safe; zero JS behaviour.
 */
export function PosterFallback({ src, avif, webp, alt = '', width, height, eager = false, loading, fetchPriority, className, style, children }: PosterFallbackProps) {
  const cls = ['ui-poster', className].filter(Boolean).join(' ')
  if (children) {
    return (
      <div className={cls} style={style} data-poster="">
        {children}
      </div>
    )
  }
  if (!src) {
    return <div className={`${cls} ui-poster--procedural`} style={style} data-poster="" aria-hidden="true" />
  }
  return (
    <div className={cls} style={style} data-poster="">
      <picture>
        {avif ? <source type="image/avif" srcSet={avif} /> : null}
        {webp ? <source type="image/webp" srcSet={webp} /> : null}
        <img
          className="ui-poster__img"
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading ?? (eager ? 'eager' : 'lazy')}
          decoding="async"
          {...(fetchPriority ? { fetchPriority } : {})}
        />
      </picture>
    </div>
  )
}
