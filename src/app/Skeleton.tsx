import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** CSS width (number = px). Default 100%. */
  width?: number | string
  /** CSS height (number = px). Default 1em (a line of text). */
  height?: number | string
  shape?: 'line' | 'block' | 'pill' | 'circle'
}

const px = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v)

/**
 * A placeholder shape while content loads (spec §7 P1; Carbon data table loading). Decorative and
 * aria-hidden: announce loading once on the container (SkeletonGroup). The shimmer runs once for
 * at most 1s and then stays static (spec §6.3 rule 7); none under reduced motion or Pause.
 */
export function Skeleton({ width, height, shape = 'line', className, style, ...rest }: SkeletonProps) {
  const s: CSSProperties = { ...style }
  if (width !== undefined) s.inlineSize = px(width)
  if (height !== undefined) s.blockSize = px(height)
  return <span {...rest} aria-hidden="true" className={cx('ui-skeleton', className)} data-shape={shape} style={s} />
}

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Announced once to screen readers. Default "Loading…". */
  label?: string
  children?: ReactNode
}

/** Wraps skeletons: role=status with a visually hidden label and aria-busy while it is shown. */
export function SkeletonGroup({ label = 'Loading…', className, children, ...rest }: SkeletonGroupProps) {
  return (
    <div {...rest} role="status" aria-busy="true" className={cx('ui-skeleton-group', className)}>
      <span className="ui-visually-hidden">{label}</span>
      {children}
    </div>
  )
}
