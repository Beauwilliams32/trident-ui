/**
 * @trident/ui/motion-lite — library-free port of williams-media-portal 07-motion.js, about 2KB gz
 * (spec §6.1 tier 1). No React, no animation library, nothing touches `window` at import time.
 *
 *   import { initMotion } from '@trident/ui/motion-lite'
 *   initMotion()   // reveals, count-ups, tilt, Pause-motion buttons
 *
 * Separate subpath entry: NOT re-exported from the package root.
 */
export { finePointer, hasDOM, lowPower, motionOff, mq, paused, reduced, tokenNumber } from './env'
export type { LowPowerNavigator } from './env'
export {
  bindMotionToggle,
  handleMotionToggleClick,
  MOTION_CHANGE_EVENT,
  MOTION_STORAGE_KEY,
  MOTION_TOGGLE_ATTR,
  restoreMotionPreference,
  setMotionPaused,
  storedMotionPaused,
  subscribeMotion,
  toggleMotionPaused,
} from './pause'
export { markRevealed, observeReveal, REVEALED_ATTR, revealAll, scanReveals, watchReveals } from './reveal'
export { countUp, countUpWhenVisible, formatNumber, isCountable, parseNumber } from './count'
export type { CountUpOptions, NumberSpec } from './count'
export { bindTilt, resetTilt, unbindTilt } from './tilt'
export { canTransition, transition } from './transition'
export type { TransitionOptions } from './transition'
export { armMotion, initMotion, MOTION_CLASS } from './init'
export type { InitMotionOptions } from './init'
