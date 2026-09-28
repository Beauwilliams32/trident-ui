/** Spacing steps (spec §5, 4px base). Values map to the --ui-space-* tokens. */
export const SPACE_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32] as const
export type Space = (typeof SPACE_STEPS)[number]

/** Class for a gap step, e.g. 4 -> "ui-gap-4", 0.5 -> "ui-gap-0-5". */
export function gapClass(step: Space): string {
  return `ui-gap-${String(step).replace('.', '-')}`
}
