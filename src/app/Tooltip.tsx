import * as RT from '@radix-ui/react-tooltip'
import type { ReactElement, ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface TooltipProps {
  /** The tooltip text. Supplementary only: never the only place information lives. */
  content: ReactNode
  /** One focusable element (an IconButton). The tooltip shows on hover and on keyboard focus. */
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Hover delay in ms. Default 400; keyboard focus shows it at once. */
  delay?: number
  className?: string
}

/**
 * Tooltip (spec §7 P1, WCAG 1.4.13; Radix Tooltip): appears on hover and focus, can be hovered
 * without vanishing, and Escape dismisses it without moving focus. An IconButton still needs its
 * own aria-label; the tooltip repeats it visually.
 */
export function Tooltip({ content, children, side = 'top', delay = 400, className }: TooltipProps) {
  return (
    <RT.Provider delayDuration={delay} skipDelayDuration={300}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content className={cx('ui-tooltip', className)} side={side} sideOffset={6} collisionPadding={8}>
            {content}
            <RT.Arrow className="ui-tooltip__arrow" width={10} height={5} />
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  )
}
