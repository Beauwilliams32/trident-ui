import type { HTMLAttributes, Ref } from 'react'
import { cx, devWarnOnce } from '../a11y/internal'

export interface GradTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** One or two words (spec §4). Plain text only, so screen readers read it normally. */
  children: string
  ref?: Ref<HTMLSpanElement>
}

/** Counts words the way a reader would: whitespace-separated runs. */
export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

/**
 * Accent-gradient text for one or two words of a display heading. Falls back to the solid
 * `--ui-accent-text` colour where background-clip:text is unsupported, and to CanvasText under
 * forced colours. Use it at display sizes only: the gradient's second stop is a fill colour.
 */
export function GradText({ children, className, ...rest }: GradTextProps) {
  if (countWords(children) > 2) {
    devWarnOnce(`gradtext:${children}`, `GradText is for one or two words; got "${children}". Wrap only the key word(s).`)
  }
  return (
    <span {...rest} className={cx('ui-grad-text', className)}>
      {children}
    </span>
  )
}
