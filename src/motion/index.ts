/**
 * @trident/ui/motion — apps only (spec §6.1 tier 2). Wrappers over motion/react 13 plus the
 * React faces of motion-lite. `motion` is an OPTIONAL peer dependency, so this is a separate
 * subpath entry and is NOT re-exported from the package root.
 *
 *   <MotionRoot>            LazyMotion(domAnimation, strict) + MotionConfig(reducedMotion="user")
 *     <m.div transition={springs.snappy} … />
 */
export { AnimatePresence, domAnimation, m } from 'motion/react'
export { MotionRoot } from './MotionRoot'
export type { MotionRootProps } from './MotionRoot'
export { distances, durations, easings, EXIT_RATIO, exitDuration, springs, transitions } from './presets'
export { useMotionOff, useMotionPaused, usePrefersReducedMotion } from './hooks'
export { Reveal } from './Reveal'
export type { RevealProps } from './Reveal'
export { CountUp } from './CountUp'
export type { CountUpProps } from './CountUp'
export { Tilt } from './Tilt'
export type { TiltProps } from './Tilt'
export { ViewTransitionLink } from './ViewTransitionLink'
export type { ViewTransitionLinkProps } from './ViewTransitionLink'
export { AmbientGlow } from './AmbientGlow'
export type { AmbientGlowProps } from './AmbientGlow'
export { MotionToggle } from './MotionToggle'
export type { MotionToggleProps } from './MotionToggle'
