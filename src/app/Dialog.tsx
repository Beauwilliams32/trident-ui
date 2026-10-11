import * as RD from '@radix-ui/react-dialog'
import type { ReactElement, ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../actions/Button'
import { cx } from '../actions/internal'
import { useReturnFocus } from './focus'

export type DialogSize = 'sm' | 'md' | 'lg'
export type SheetSide = 'right' | 'left' | 'bottom' | 'top'

interface OverlayBaseProps {
  /** Controlled open state. Omit for an uncontrolled dialog opened by `trigger`. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The element that opens it (a Button). Radix wires aria-haspopup, aria-expanded and focus return. */
  trigger?: ReactElement
  /** Required visible title: it names the dialog (aria-labelledby). */
  title: ReactNode
  /** Optional line under the title; it describes the dialog (aria-describedby). */
  description?: ReactNode
  children?: ReactNode
  /** Actions row (Buttons). Wrap a closing button in `<DialogClose asChild>`. */
  footer?: ReactNode
  /** Accessible name of the corner close button. Default "Close". */
  closeLabel?: string
  className?: string
}

export interface DialogProps extends OverlayBaseProps {
  /** Width: sm 400px, md 560px (default), lg 760px; never wider than the viewport minus 32px. */
  size?: DialogSize
}

export interface SheetProps extends OverlayBaseProps {
  /** The edge the sheet slides from. Default "right". On phones a side sheet is full width. */
  side?: SheetSide
}

function Body({ title, description, children, footer, closeLabel = 'Close' }: OverlayBaseProps) {
  return (
    <>
      <div className="ui-dialog__header">
        <RD.Title className="ui-dialog__title">{title}</RD.Title>
        {description ? <RD.Description className="ui-dialog__description">{description}</RD.Description> : null}
      </div>
      {children ? <div className="ui-dialog__body">{children}</div> : null}
      {footer ? <div className="ui-dialog__footer">{footer}</div> : null}
      <RD.Close asChild>
        <IconButton icon={X} aria-label={closeLabel} variant="ghost" size="sm" className="ui-dialog__close" />
      </RD.Close>
    </>
  )
}

function Shell({ open, defaultOpen, onOpenChange, trigger, className, contentClass, data, ...body }: OverlayBaseProps & { contentClass: string; data: Record<string, string> }) {
  const focus = useReturnFocus(Boolean(trigger))
  return (
    <RD.Root {...(open === undefined ? {} : { open })} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <RD.Trigger asChild>{trigger}</RD.Trigger> : null}
      <RD.Portal>
        <RD.Overlay className="ui-overlay" />
        <RD.Content className={cx(contentClass, className)} {...data} {...focus} {...(body.description ? {} : { 'aria-describedby': undefined })}>
          <Body {...body} />
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  )
}

/**
 * Modal dialog (spec §7 P1; Radix Dialog). Focus moves in and is trapped, the page behind is inert,
 * Escape or the close button closes it, and focus returns to the trigger. Solid surface, no blur
 * (spec §5 e3/e4 overlays). For "are you sure?" use ConfirmDialog, which cannot be dismissed by a
 * stray click outside.
 */
export function Dialog({ size = 'md', ...props }: DialogProps) {
  return <Shell {...props} contentClass="ui-dialog" data={{ 'data-size': size }} />
}

/** A dialog that slides from an edge (filters, detail panes, mobile navigation). */
export function Sheet({ side = 'right', ...props }: SheetProps) {
  return <Shell {...props} contentClass="ui-dialog ui-sheet" data={{ 'data-side': side }} />
}

/** Closes the surrounding Dialog or Sheet. Use with `asChild` around a Button. */
export const DialogClose = RD.Close
