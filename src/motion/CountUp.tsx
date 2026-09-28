import { useEffect, useRef } from 'react'
import type { CSSProperties, ElementType } from 'react'
import { countUpWhenVisible, isCountable } from '../motion-lite'

export interface CountUpProps {
  /**
   * The real value, from props only (spec §6.3 rule 9): an API result or server data, never an
   * invented number. Prefix, suffix, decimals and thousands separators are kept ("$1,500/mo").
   */
  value: string | number
  /** Force (true) or forbid (false) counting. Default: only a single real quantity counts. */
  countable?: boolean
  /** Milliseconds. Default --ui-dur-count (1100ms). */
  duration?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * Renders the final value (SSR and no-JS read it) and counts from 0 the first time 40% of it is
 * visible. Screen readers get the final value only; the moving digits are aria-hidden.
 * Reduced motion or Pause: the final value, and no requestAnimationFrame.
 */
export function CountUp({ value, countable, duration, as: Tag = 'span', className, style }: CountUpProps) {
  const text = String(value ?? '')
  const digits = useRef<HTMLSpanElement>(null)
  const animates = isCountable(text, countable)
  useEffect(() => {
    const el = digits.current
    if (!el || !animates) return undefined
    return countUpWhenVisible(el, { value: text, countable: true, ...(duration != null ? { duration } : {}) })
  }, [text, animates, duration])
  if (!animates) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    )
  }
  // The digits are written by countUp every frame, so React owns only the innerHTML prop and never
  // diffs the text node (a re-render with the same value would otherwise keep a stale frame).
  return (
    <Tag className={className} style={style} data-count="">
      <span ref={digits} className="ui-count-digits" aria-hidden="true" dangerouslySetInnerHTML={{ __html: escapeText(text) }} />
      <span className="ui-visually-hidden">{text}</span>
    </Tag>
  )
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
