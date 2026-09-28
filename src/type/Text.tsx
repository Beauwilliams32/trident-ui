import type { HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import type { TextSize, TextTone } from './scale'
import type { HtmlTag } from '../utils/poly'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default "p". */
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small' | 'figcaption' | 'label' | 'dd' | 'dt' | 'li'
  /** Default "base" (16px, line-height 1.6). Body copy should stay at base or larger (spec §4). */
  size?: TextSize
  /** Default "ink". "accent" uses --ui-accent-text, which is at least 4.5:1 in every theme. */
  tone?: TextTone
  weight?: 'body' | 'medium' | 'display' | 'bold'
  /** Cap the line length at 68ch (spec §4). */
  measure?: boolean
  /** Tabular numerals, for stats and tables. */
  tabular?: boolean
  ref?: Ref<HTMLElement>
}

/** Body text on the type scale. */
export function Text({ as = 'p', size = 'base', tone = 'ink', weight, measure, tabular, className, ...rest }: TextProps) {
  const Comp = as as HtmlTag
  return (
    <Comp
      {...rest}
      className={cx(
        'ui-text',
        `ui-fs-${size}`,
        tone !== 'ink' && `ui-tone-${tone}`,
        weight && `ui-weight-${weight}`,
        measure && 'ui-measure',
        tabular && 'ui-tabular',
        className,
      )}
    />
  )
}
