import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import { gapClass } from './space'
import type { Space } from './space'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Gap between children, as a spacing step. Default 4 (16px). */
  gap?: Space
  /** Cross-axis alignment. Default "stretch". */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Element to render. Default "div". Use "ul"/"ol" for lists (list semantics are kept). */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/** Vertical flow with a consistent gap. Pure CSS; no inline styles (CSP-safe). */
export function Stack({ gap = 4, align = 'stretch', as: Comp = 'div', className, ...rest }: StackProps) {
  return <Comp {...rest} className={cx('ui-stack', gapClass(gap), `ui-align-${align}`, className)} />
}
