import { useState, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from './cx'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

/** Portal `_ds_bundle.js` Avatar dimensions, in px. */
export const AVATAR_SIZES: Record<AvatarSize, number> = { xs: 30, sm: 42, md: 58, lg: 94 }

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials if missing or if it fails to load. */
  src?: string
  /** Person or brand name: the image alt text, the initials source and the accessible name. */
  name?: string
  /** Named size or a pixel number. */
  size?: AvatarSize | number
  /** `rounded` (brand square, 26% radius) or `circle`. */
  shape?: 'rounded' | 'circle'
  /** Hide from assistive tech when the name is already next to the avatar. */
  decorative?: boolean
}

/** Up to two initials from a name ("Beau Williams" -> "BW"). */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Image avatar with an initials fallback (spec §7 P0; portal `_ds_bundle.js` Avatar). Initials are
 * `--ui-on-accent` on the accent fill, which the §9 matrix guarantees at 4.5:1. Always has a text
 * alternative (alt text or aria-label) unless `decorative` or there is no name.
 */
export function Avatar({ src, name = '', size = 'md', shape = 'rounded', decorative, className, style, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null)
  const px = typeof size === 'number' ? size : (AVATAR_SIZES[size] ?? AVATAR_SIZES.md)
  const showImage = Boolean(src) && failed !== src
  const initials = initialsOf(name) || '?'
  const hidden = decorative || !name.trim()
  const vars = { '--ui-avatar-size': `${px}px`, ...style } as CSSProperties
  return (
    <span
      {...rest}
      className={cx('ui-avatar', className)}
      data-shape={shape}
      data-fallback={showImage ? undefined : ''}
      style={vars}
      title={rest.title ?? (name || undefined)}
      role={showImage || hidden ? undefined : 'img'}
      aria-label={showImage || hidden ? undefined : name}
      aria-hidden={hidden ? true : undefined}
    >
      {showImage ? (
        <img className="ui-avatar__img" src={src} alt={hidden ? '' : name} width={px} height={px} decoding="async" onError={() => setFailed(src ?? null)} />
      ) : (
        <span className="ui-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  )
}
