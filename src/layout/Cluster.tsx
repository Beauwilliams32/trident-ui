import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import { gapClass } from './space'
import type { Space } from './space'

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  /** Gap between children, as a spacing step. Default 2 (8px). */
  gap?: Space
  /** Main-axis distribution. Default "start". */
  justify?: 'start' | 'center' | 'end' | 'between'
  /** Cross-axis alignment. Default "center". */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  /** Wrap onto new lines when out of room. Default true. */
  wrap?: boolean
  /** Element to render. Default "div". */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/** Horizontal group that wraps: button rows, tag lists, nav links. */
export function Cluster({
  gap = 2,
  justify = 'start',
  align = 'center',
  wrap = true,
  as: Comp = 'div',
  className,
  ...rest
}: ClusterProps) {
  return (
    <Comp
      {...rest}
      className={cx('ui-cluster', gapClass(gap), `ui-justify-${justify}`, `ui-align-${align}`, !wrap && 'ui-nowrap', className)}
    />
  )
}
