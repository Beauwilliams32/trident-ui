import type { HTMLAttributes, ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cx } from '../actions/internal'

export interface FormErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional bold first line. */
  title?: ReactNode
  /** The message. Nothing renders when empty, so it is safe to always mount with server flash data. */
  children?: ReactNode
}

/**
 * A form-level error (e.g. "Your session expired, please try again"). role="alert" so a message
 * that appears after an enhanced submit is announced; text is ink on surface, so contrast holds in
 * every theme, and the danger colour is carried by the border and icon (never colour alone).
 */
export function FormError({ title, children, className, ...rest }: FormErrorProps) {
  const empty = children === undefined || children === null || children === false || children === ''
  if (empty && !title) return null
  return (
    <div role="alert" {...rest} className={cx('ui-form-error', className)}>
      <CircleAlert className="ui-form-error__icon" size={20} strokeWidth={2} aria-hidden="true" focusable="false" />
      <div className="ui-form-error__body">
        {title ? <p className="ui-form-error__title">{title}</p> : null}
        {empty ? null : <div className="ui-form-error__message">{children}</div>}
      </div>
    </div>
  )
}
