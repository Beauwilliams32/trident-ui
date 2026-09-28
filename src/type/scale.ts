/** Type scale steps (spec §4). Values map to the --ui-text-* tokens. */
export const TEXT_SIZES = ['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'display'] as const
export type TextSize = (typeof TEXT_SIZES)[number]
export type TextTone = 'ink' | 'ink-2' | 'muted' | 'accent'
