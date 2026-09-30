/**
 * Motion presets for motion/react (spec §6.2). Values mirror tokens.json `motion` (a test pins
 * that they stay equal), in the units motion/react expects: seconds and bezier arrays.
 */
export const springs = {
  /** Toggles, menus. */
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
  /** Sheets, dialogs. */
  smooth: { type: 'spring', stiffness: 300, damping: 34, mass: 1 },
  /** Hero text only. */
  gentle: { type: 'spring', stiffness: 160, damping: 26, mass: 1 },
} as const

/** Durations in seconds (tokens are ms). */
export const durations = {
  instant: 0.08,
  fast: 0.16,
  base: 0.2,
  page: 0.26,
  med: 0.32,
  slow: 0.48,
  reveal: 0.6,
  count: 1.1,
} as const

export const easings = {
  ease: [0.2, 0.8, 0.2, 1],
  emph: [0.2, 0, 0, 1],
  exit: [0.4, 0, 1, 1],
  inout: [0.4, 0, 0.2, 1],
  spring: [0.22, 1.2, 0.36, 1],
  springPop: [0.34, 1.4, 0.64, 1],
} as const

/** Exits run at about 0.7× their enter (spec §6.3 rule 2). */
export const EXIT_RATIO = 0.7
export const exitDuration = (enterSeconds: number): number => Math.round(enterSeconds * EXIT_RATIO * 1000) / 1000

/** Ready-made enter/exit transitions for m.* components (transform + opacity only). */
export const transitions = {
  enter: { duration: durations.med, ease: easings.emph },
  exit: { duration: exitDuration(durations.med), ease: easings.exit },
  page: { duration: durations.page, ease: easings.ease },
  fade: { duration: durations.fast, ease: easings.ease },
} as const

export const distances = { reveal: 18, stagger: 70, staggerMax: 6, tiltMax: 7, lift: -3 } as const
