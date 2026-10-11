import { useSyncExternalStore } from 'react'
import { Pause, Play } from 'lucide-react'
import { handleMotionToggleClick, MOTION_TOGGLE_ATTR, paused, subscribeMotion } from '../motion-lite'

export interface MotionToggleProps {
  /** Visible label; fixed while the state changes (aria-pressed carries the state). */
  label?: string
  className?: string
}

/**
 * The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for static and marketing
 * pages. The same markup and store as `@trident/ui/motion`'s MotionToggle, built on motion-lite, so
 * it needs no `motion` peer (G6: Ops re-implemented exactly this to keep the library off its landing).
 */
export function MotionToggle({ label = 'Pause motion', className }: MotionToggleProps) {
  const isPaused = useSyncExternalStore(subscribeMotion, paused, () => false)
  return (
    <button
      type="button"
      className={className ? `ui-motion-toggle ${className}` : 'ui-motion-toggle'}
      aria-pressed={isPaused}
      onClick={(e) => handleMotionToggleClick(e.nativeEvent)}
      {...{ [MOTION_TOGGLE_ATTR]: '' }}
    >
      {isPaused ? <Play aria-hidden="true" size={14} /> : <Pause aria-hidden="true" size={14} />}
      {label}
    </button>
  )
}
