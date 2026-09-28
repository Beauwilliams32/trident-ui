import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../a11y/internal'

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /**
   * Render a block (`<pre><code>`) instead of inline `<code>`. The block scrolls horizontally
   * and is keyboard-focusable so its overflow can be scrolled without a mouse (WCAG 2.1.1).
   */
  block?: boolean
  /** Accessible name for a block, e.g. "Install command". Recommended for blocks. */
  label?: string
}

/** Inline code or a code block. */
export function Code({ block = false, label, className, children, ...rest }: CodeProps) {
  if (!block) {
    return (
      <code {...rest} className={cx('ui-code', className)}>
        {children}
      </code>
    )
  }
  return (
    <pre
      className={cx('ui-code-block', className)}
      tabIndex={0}
      {...(label ? { role: 'region', 'aria-label': label } : {})}
    >
      <code {...rest}>{children}</code>
    </pre>
  )
}
