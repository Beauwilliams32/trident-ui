import { useEffect } from 'react'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { bindTilt } from '../motion-lite'
import { useMotionOff } from './hooks'
import type { HtmlTag } from '../utils/poly'

export interface TiltProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children?: ReactNode
}

/**
 * Follows a fine pointer, at most 7deg (spec §6.2). Touch, reduced motion and Pause: flat, and no
 * listener or rAF is started. Decorative only: never put the only copy of information in the tilt.
 */
export function Tilt({ as = 'div', children, ...rest }: TiltProps) {
  const Tag = as as HtmlTag
  const off = useMotionOff()
  useEffect(() => {
    if (!off) bindTilt()
  }, [off])
  return (
    <Tag data-tilt="" {...rest}>
      {children}
    </Tag>
  )
}
