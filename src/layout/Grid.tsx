import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import { gapClass } from './space'
import type { Space } from './space'
import type { HtmlTag } from '../utils/poly'

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
/** Minimum track width for the auto-fit grid: xs 160px, sm 220px, md 280px, lg 340px. */
export type GridMin = 'xs' | 'sm' | 'md' | 'lg'

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /**
   * Fixed column count (12-column system, spec §5). Collapses to one column below 768px unless
   * `collapse` is false. Omit it for an auto-fit grid driven by `min`.
   */
  columns?: GridColumns
  /** Auto-fit minimum track width, used when `columns` is omitted. Default "md". */
  min?: GridMin
  /** Gap as a spacing step. Default 6 (24px). */
  gap?: Space
  /** With `columns`, stack to one column below 768px. Default true. */
  collapse?: boolean
  /** Element to render. Default "div". */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/** CSS grid. Either a fixed column count or an auto-fit grid that never overflows at 360px. */
export function Grid({ columns, min = 'md', gap = 6, collapse = true, as = 'div', className, ...rest }: GridProps) {
  const Comp = as as HtmlTag
  return (
    <Comp
      {...rest}
      className={cx(
        'ui-grid',
        gapClass(gap),
        columns ? `ui-grid-cols-${columns}` : `ui-grid-min-${min}`,
        columns && collapse && 'ui-grid-collapse',
        className,
      )}
    />
  )
}
