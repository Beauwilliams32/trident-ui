import type { MouseEvent } from 'react'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { handleMotionToggleClick, MOTION_TOGGLE_ATTR } from '../motion-lite'
import { useMotionPaused } from './hooks'

export interface MotionToggleProps {
  /** Visible label; fixed while the state changes (aria-pressed carries the state). */
  label?: string
  className?: string
}

/**
 * The persistent "Pause motion" control (spec §6.3 rule 5, WCAG 2.2.2) for the footer or nav.
 * Sets html[data-motion="paused"] and stores it in localStorage (try/catch). Its markup is the
 * same one motion-lite's initMotion() binds, so a static page without React works too.
 */
export function MotionToggle({ label = 'Pause motion', className }: MotionToggleProps) {
  const isPaused = useMotionPaused()
  const onClick = (e: MouseEvent<HTMLButtonElement>) => handleMotionToggleClick(e.nativeEvent)
  return (
    <button
      type="button"
      className={className ? `ui-motion-toggle ${className}` : 'ui-motion-toggle'}
      aria-pressed={isPaused}
      onClick={onClick}
      {...{ [MOTION_TOGGLE_ATTR]: '' }}
    >
      {isPaused ? <PlayIcon aria-hidden="true" size={14} /> : <PauseIcon aria-hidden="true" size={14} />}
      {label}
    </button>
  )
}
