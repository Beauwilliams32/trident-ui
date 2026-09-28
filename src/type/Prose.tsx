import type { ElementType, HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'
import type { HtmlTag } from '../utils/poly'

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default "div"; use "article" for a standalone document. */
  as?: ElementType
  ref?: Ref<HTMLElement>
}

/**
 * Typography for long-form HTML you do not control element by element (legal pages, CMS or
 * Markdown output): rhythm, 68ch measure, underlined links, lists, quotes, code and tables.
 * It styles markup only; it never rewrites heading levels, so the source must be well ordered.
 */
export function Prose({ as = 'div', className, ...rest }: ProseProps) {
  const Comp = as as HtmlTag
  return <Comp {...rest} className={cx('ui-prose', className)} />
}
