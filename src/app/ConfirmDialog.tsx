import * as AD from '@radix-ui/react-alert-dialog'
import type { ReactElement, ReactNode } from 'react'
import { buttonClassName } from '../actions/Button'
import { cx } from '../actions/internal'
import { useReturnFocus } from './focus'

export interface ConfirmDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The element that opens it (a Button). */
  trigger?: ReactElement
  /** The question, e.g. "Refund this deal?". */
  title: ReactNode
  /** Required: what happens and whether it can be undone. */
  description: ReactNode
  /** The confirming action's label, a verb ("Refund $120"), never "OK" or "Yes". */
  confirmLabel: ReactNode
  /** Default "Cancel". It receives focus first, so Enter never confirms by accident. */
  cancelLabel?: ReactNode
  /** Runs when the confirm button is pressed (the dialog then closes). */
  onConfirm?: () => void
  /**
   * The id of a native `<form>` the confirm button submits (`form.requestSubmit()`, so validation
   * and submit handlers run), keeping the server authoritative (spec §7: the NIL refund).
   */
  confirmForm?: string
  /** Style the confirm button as destructive (danger outline). It is still not the default focus. */
  destructive?: boolean
  children?: ReactNode
  className?: string
}

/**
 * The replacement for `window.confirm()` (spec §7 P1 AlertDialog/ConfirmDialog; Radix AlertDialog).
 * It cannot be dismissed by clicking outside; Escape and Cancel close it; Cancel has initial focus.
 * Destructive actions are styled as danger but never as the primary fill (Apple HIG "Role").
 */
export function ConfirmDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmForm,
  destructive = false,
  children,
  className,
}: ConfirmDialogProps) {
  const focus = useReturnFocus(Boolean(trigger))
  return (
    <AD.Root {...(open === undefined ? {} : { open })} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <AD.Trigger asChild>{trigger}</AD.Trigger> : null}
      <AD.Portal>
        <AD.Overlay className="ui-overlay" />
        <AD.Content className={cx('ui-dialog', className)} data-size="sm" data-role="alertdialog" onCloseAutoFocus={focus.onCloseAutoFocus} onOpenAutoFocus={focus.onOpenAutoFocus}>
          <div className="ui-dialog__header">
            <AD.Title className="ui-dialog__title">{title}</AD.Title>
            <AD.Description className="ui-dialog__description">{description}</AD.Description>
          </div>
          {children ? <div className="ui-dialog__body">{children}</div> : null}
          <div className="ui-dialog__footer">
            <AD.Cancel className={buttonClassName({ variant: 'secondary' })}>
              <span className="ui-btn__label">{cancelLabel}</span>
            </AD.Cancel>
            <AD.Action
              className={buttonClassName({ variant: destructive ? 'danger' : 'primary' })}
              onClick={() => {
                onConfirm?.()
                if (confirmForm) (document.getElementById(confirmForm) as HTMLFormElement | null)?.requestSubmit()
              }}
            >
              <span className="ui-btn__label">{confirmLabel}</span>
            </AD.Action>
          </div>
        </AD.Content>
      </AD.Portal>
    </AD.Root>
  )
}
