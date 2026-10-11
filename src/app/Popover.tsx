import * as RP from '@radix-ui/react-popover'
import type { ReactElement, ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The element that toggles it (a Button). */
  trigger: ReactElement
  children: ReactNode
  /** Names the popover content for screen readers. */
  label?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * Non-modal floating panel anchored to its trigger (spec §7 P1; Radix Popover): filters, quick
 * settings, a date. Escape or a click outside closes it and focus returns to the trigger.
 */
export function Popover({ open, defaultOpen, onOpenChange, trigger, children, label, side = 'bottom', align = 'start', className }: PopoverProps) {
  return (
    <RP.Root {...(open === undefined ? {} : { open })} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RP.Trigger asChild>{trigger}</RP.Trigger>
      <RP.Portal>
        <RP.Content className={cx('ui-popover', className)} side={side} align={align} sideOffset={8} collisionPadding={16} aria-label={label}>
          {children}
          <RP.Arrow className="ui-popover__arrow" width={12} height={6} />
        </RP.Content>
      </RP.Portal>
    </RP.Root>
  )
}

export const PopoverClose = RP.Close
