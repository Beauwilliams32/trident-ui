import type { HTMLAttributes, Ref } from 'react'
import { cx } from '../a11y/internal'

export interface MonoProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>
}

/** Monospace run with tabular numerals: prices, IDs, timestamps (spec §4). Not code; use Code. */
export function Mono({ className, ...rest }: MonoProps) {
  return <span {...rest} className={cx('ui-mono', className)} />
}
