import type { ReactNode } from 'react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { LazyProps } from 'motion/react'
import { armMotion, restoreMotionPreference } from '../motion-lite'
import { useIsoLayoutEffect, useMotionPaused } from './hooks'

export interface MotionRootProps {
  children?: ReactNode
  /**
   * Feature bundle. Default `domAnimation` (about 15KB gz). Pass `domMax` (or a lazy
   * `() => import('./features').then(m => m.default)`) only where layout animation or drag is
   * needed: Ops widgets, the portal board, Quorum (spec §6.1).
   */
  features?: LazyProps['features']
}

/**
 * App root for motion/react (spec §6.1 tier 2): `<LazyMotion strict>` so only `m.*` components
 * work, and `<MotionConfig reducedMotion="user">` — switched to "always" while Pause is on.
 * Also restores the stored Pause choice and arms html.ui-motion for [data-reveal].
 */
export function MotionRoot({ children, features = domAnimation }: MotionRootProps) {
  const isPaused = useMotionPaused()
  useIsoLayoutEffect(() => {
    restoreMotionPreference()
    armMotion()
  }, [])
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion={isPaused ? 'always' : 'user'}>{children}</MotionConfig>
    </LazyMotion>
  )
}
