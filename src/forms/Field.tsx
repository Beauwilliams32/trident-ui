import { useId, type FieldsetHTMLAttributes, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cx } from '../actions/internal'
import { ChoiceGroupContext, FieldContext, fieldId, type ChoiceGroupContextValue, type FieldContextValue } from './context'

/** Inline field error. "Error:" is announced before the message; the icon is decorative. */
export function FieldErrorText({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <p id={id} className={cx('ui-field__error', className)}>
      <CircleAlert className="ui-field__error-icon" size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
      <span>
        <span className="ui-visually-hidden">Error: </span>
        {children}
      </span>
    </p>
  )
}

function RequiredMark() {
  return (
    <span className="ui-field__req" aria-hidden="true">
      {' *'}
    </span>
  )
}

export interface FieldProps {
  /** Visible label (required: placeholder is never a label). */
  label: ReactNode
  /** Form field name. Also the default id, so ErrorSummary can link to it by name. */
  name?: string
  /** Explicit control id. Default: fieldId(name), else a React useId(). */
  id?: string
  hint?: ReactNode
  /** Error message; marks the control aria-invalid and links it via aria-describedby. */
  error?: ReactNode
  required?: boolean
  disabled?: boolean
  className?: string
  /** One control: Input, Textarea or Select. */
  children: ReactNode
}

/**
 * Label + hint + error around a single control, wired with htmlFor / aria-describedby /
 * aria-invalid / required through context. Pure markup: works in renderToStaticMarkup.
 */
export function Field({ label, name, id, hint, error, required = false, disabled = false, className, children }: FieldProps) {
  const autoId = useId()
  const controlId = id ?? (name ? fieldId(name) : autoId)
  const hasError = error !== undefined && error !== null && error !== false && error !== ''
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = hasError ? `${controlId}-error` : undefined
  const ctx: FieldContextValue = { id: controlId, name, hintId, errorId, invalid: hasError, required, disabled }
  return (
    <div className={cx('ui-field', className)} data-invalid={hasError ? '' : undefined}>
      <label className="ui-field__label" htmlFor={controlId}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {hint ? (
        <p id={hintId} className="ui-field__hint">
          {hint}
        </p>
      ) : null}
      {hasError ? <FieldErrorText id={errorId}>{error}</FieldErrorText> : null}
      <FieldContext.Provider value={ctx}>{children}</FieldContext.Provider>
    </div>
  )
}

export interface FieldsetProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'name'> {
  /** Visible group label, rendered as `<legend>`. */
  legend: ReactNode
  /** Shared name for the Radio / Checkbox options inside; also the default id (for ErrorSummary). */
  name?: string
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
}

/** `<fieldset>` + `<legend>` for a group of Radio, Checkbox or Switch options. */
export function Fieldset({ legend, name, id, hint, error, required = false, disabled = false, className, children, ...rest }: FieldsetProps) {
  const autoId = useId()
  const groupId = id ?? (name ? fieldId(name) : autoId)
  const hasError = error !== undefined && error !== null && error !== false && error !== ''
  const hintId = hint ? `${groupId}-hint` : undefined
  const errorId = hasError ? `${groupId}-error` : undefined
  const ctx: ChoiceGroupContextValue = { name, invalid: hasError, required, disabled }
  const describedBy = [hintId, errorId, rest['aria-describedby']].filter(Boolean).join(' ') || undefined
  return (
    <fieldset
      {...rest}
      id={groupId}
      disabled={disabled || undefined}
      aria-describedby={describedBy}
      className={cx('ui-fieldset', className)}
      data-invalid={hasError ? '' : undefined}
    >
      <legend className="ui-fieldset__legend">
        {legend}
        {required ? <RequiredMark /> : null}
      </legend>
      {hint ? (
        <p id={hintId} className="ui-field__hint">
          {hint}
        </p>
      ) : null}
      {hasError ? <FieldErrorText id={errorId}>{error}</FieldErrorText> : null}
      <ChoiceGroupContext.Provider value={ctx}>
        <div className="ui-fieldset__options">{children}</div>
      </ChoiceGroupContext.Provider>
    </fieldset>
  )
}
