import type { CSSProperties } from 'react'

export interface AmbientGlowProps {
  /** Which accent tints the glow. Default `accent`. */
  tone?: 'accent' | 'accent-2' | 'glow'
  /** Drifting loop (longer than 5s, so Pause and reduced motion make it static). Default true. */
  drift?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Decorative CSS-only glow behind a hero or section: no JS, no rAF. Position it inside a
 * `position: relative` parent. aria-hidden; transform and opacity only (spec §6.3 rule 1).
 */
export function AmbientGlow({ tone = 'accent', drift = true, className, style }: AmbientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={className ? `ui-ambient-glow ${className}` : 'ui-ambient-glow'}
      data-tone={tone}
      data-drift={drift ? '' : undefined}
      style={style}
    />
  )
}
