import { useEffect, useRef } from 'react'
import type { HTMLAttributes, Ref } from 'react'
import { cx, devWarnOnce, isDev, mergeRefs } from '../a11y/internal'
import { checkHeadingOutline } from './outline'
import type { HeadingLevel } from './outline'
import type { TextSize, TextTone } from './scale'

const DEFAULT_SIZE: Record<HeadingLevel, TextSize> = { 1: '4xl', 2: '3xl', 3: '2xl', 4: 'xl', 5: 'lg', 6: 'md' }

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Required: the outline level (h1 to h6). Choose it from the document structure, never the look. */
  level: HeadingLevel
  /** Visual size, independent of level. Defaults: h1 4xl, h2 3xl, h3 2xl, h4 xl, h5 lg, h6 md. */
  size?: TextSize
  /** Colour. Default "ink". */
  tone?: TextTone
  ref?: Ref<HTMLHeadingElement>
}

/**
 * Heading with a required level. In development it warns (console.warn, once) when it is a
 * second h1 on the page or skips a level after the previous heading (WCAG 1.3.1, spec §9).
 */
export function Heading({ level, size, tone = 'ink', className, ref, ...rest }: HeadingProps) {
  const own = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const el = own.current
    if (!el || !isDev()) return
    for (const issue of checkHeadingOutline(el.ownerDocument)) {
      if (issue.element === el) devWarnOnce(`heading:${issue.kind}:${issue.message}`, issue.message)
    }
  }, [level])

  const Tag = `h${level}` as const
  return (
    <Tag
      {...rest}
      ref={mergeRefs(own, ref)}
      className={cx('ui-heading', `ui-fs-${size ?? DEFAULT_SIZE[level]}`, tone !== 'ink' && `ui-tone-${tone}`, className)}
    />
  )
}
