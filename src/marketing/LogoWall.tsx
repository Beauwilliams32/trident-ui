import { cx } from '../actions/internal'

export interface Logo {
  /** The organisation's name; becomes the image's alt text. */
  name: string
  src: string
  width: number
  height: number
  /** Link to the organisation (or to the case study that names it). */
  href?: string
}

export interface LogoWallProps {
  /** Names the list ("Organisations that use it"). Required: a wall of logos needs a stated meaning. */
  label: string
  /** Only organisations that actually use the product and have said we may show their logo. */
  logos: ReadonlyArray<Logo>
  className?: string
}

/**
 * A row of customer or partner logos (spec §7 P1 LogoWall). Renders nothing for an empty list, so a
 * page with no permissioned logos shows no wall rather than an empty frame or a placeholder.
 */
export function LogoWall({ label, logos, className }: LogoWallProps) {
  if (logos.length === 0) return null
  return (
    <ul className={cx('ui-logos', className)} aria-label={label}>
      {logos.map((l) => {
        const img = <img src={l.src} alt={l.name} width={l.width} height={l.height} loading="lazy" decoding="async" />
        return (
          <li key={l.name} className="ui-logos__item">
            {l.href ? (
              <a href={l.href} className="ui-logos__link">
                {img}
              </a>
            ) : (
              img
            )}
          </li>
        )
      })}
    </ul>
  )
}
