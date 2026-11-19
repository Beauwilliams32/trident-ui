import * as RT from '@radix-ui/react-tooltip'
import { useEffect, useRef, useState, type FocusEvent, type ReactElement, type ReactNode } from 'react'
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
  const [open, setOpen] = useState(false)
  const focusOpenFrame = useRef<number | null>(null)

  useEffect(() => () => {
    if (focusOpenFrame.current !== null) cancelAnimationFrame(focusOpenFrame.current)
  }, [])

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    // Radix opens synchronously on focus, then dismisses the tooltip when focus scrolls its trigger
    // into view. Defer the open until that browser scroll has been processed.
    event.preventDefault()
    const trigger = event.currentTarget
    if (focusOpenFrame.current !== null) cancelAnimationFrame(focusOpenFrame.current)
    focusOpenFrame.current = requestAnimationFrame(() => {
      focusOpenFrame.current = null
      if (document.activeElement === trigger) setOpen(true)
    })
  }

  const handleBlur = () => {
    if (focusOpenFrame.current !== null) cancelAnimationFrame(focusOpenFrame.current)
    focusOpenFrame.current = null
    setOpen(false)
  }

  return (
    <RT.Provider delayDuration={delay} skipDelayDuration={300}>
      <RT.Root open={open} onOpenChange={setOpen}>
        <RT.Trigger asChild onFocus={handleFocus} onBlur={handleBlur}>{children}</RT.Trigger>
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
