import { cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'
import { cx, devWarnOnce } from './internal'

/** Class that draws the Trident focus ring on :focus-visible (2px --ui-focus, 2px offset). */
export const focusRingClass = 'ui-focus-ring'
/** Class that draws the ring on a container while a descendant has keyboard focus. */
export const focusRingWithinClass = 'ui-focus-ring-within'

export interface FocusRingProps {
  /** Exactly one element; it receives the focus-ring class. */
  children: ReactElement<{ className?: string; 'data-focus-inset'?: string }>
  /** Draw the ring when any descendant has keyboard focus (e.g. a card wrapping a link). */
  within?: boolean
  /** Draw the ring inside the element's box, for elements inside an overflow:hidden parent. */
  inset?: boolean
}

/**
 * Applies the design-system focus ring (spec §7, §9) to its single child: 2px `--ui-focus` with a
 * 2px offset (at least 3:1 in every theme, tested by the contrast matrix), `Highlight` under
 * forced colours, and never animated away. Native controls already get this ring from base.css;
 * use FocusRing for custom focusable elements and for focus-within containers.
 */
export function FocusRing({ children, within = false, inset = false }: FocusRingProps) {
  if (!isValidElement(children)) {
    devWarnOnce('focusring-child', 'FocusRing expects exactly one React element child.')
    return children
  }
  const props = children.props
  return cloneElement(children, {
    className: cx(props.className, within ? focusRingWithinClass : focusRingClass),
    ...(inset ? { 'data-focus-inset': '' } : {}),
  })
}
