import type { FormHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cx, devWarn } from '../actions/internal'

/** Default CSRF field name. Override per app to match the server (e.g. "csrf_token"). */
export const DEFAULT_CSRF_FIELD = '_csrf'

export interface CsrfFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'name' | 'defaultValue'> {
  /** The token, passed in from server props. Never generated on the client. */
  value: string
  /** Form field name the server reads. Default "_csrf". */
  name?: string
}

/** Hidden CSRF input. The value comes from the server render (spec §7, §8 Auth / Money). */
export function CsrfField({ value, name = DEFAULT_CSRF_FIELD, ...rest }: CsrfFieldProps) {
  if (!value) devWarn('CsrfField rendered without a token value; the server will reject this POST.')
  return <input {...rest} type="hidden" name={name} value={value} autoComplete="off" />
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'method'> {
  /** Native method. Defaults to "post" (native POST first, spec §7). Ignored for function actions. */
  method?: 'post' | 'get' | 'dialog'
  /** CSRF token from server props; renders a CsrfField as the first child when set. */
  csrfToken?: string
  /** CSRF field name. Default "_csrf". */
  csrfFieldName?: string
  children?: ReactNode
  ref?: Ref<HTMLFormElement>
}

/**
 * A native `<form>` that works with JavaScript disabled: method="post" by default, a real `action`,
 * and an optional server-supplied CSRF field. Hydration only adds enhancement (validation, pending).
 */
export function Form({ method = 'post', action, csrfToken, csrfFieldName, className, children, ref, ...rest }: FormProps) {
  const isFunctionAction = typeof action === 'function'
  return (
    <form {...rest} ref={ref} action={action} method={isFunctionAction ? undefined : method} className={cx('ui-form', className)}>
      {csrfToken !== undefined ? <CsrfField value={csrfToken} name={csrfFieldName} /> : null}
      {children}
    </form>
  )
}
