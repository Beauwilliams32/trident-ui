import { useRef } from 'react'
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import { armMotion, observeReveal } from '../motion-lite'
import { useIsoLayoutEffect } from './hooks'

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default `div`. */
  as?: ElementType
  /** Stagger index: 70ms × min(index, 6) delay (spec §6.2). */
  index?: number
  children?: ReactNode
}

/**
 * Rises into view the first time it is seen. The server renders it visible; it hides only once
 * JS armed html.ui-motion and motion is allowed (base.css), with a 2.5s CSS failsafe. Reduced
 * motion or Pause: shown immediately, no observer.
 */
export function Reveal({ as: Tag = 'div', index, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    armMotion()
    return observeReveal(el)
  }, [])
  const merged = index != null ? ({ ...style, '--i': index } as CSSProperties) : style
  return (
    <Tag ref={ref} data-reveal="" style={merged} {...rest}>
      {children}
    </Tag>
  )
}
