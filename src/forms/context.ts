import { createContext, useContext } from 'react'
import { joinIds } from '../actions/internal'

/**
 * Turn a form field name into the element id that Field, Fieldset and ErrorSummary agree on, so a
 * server that only knows field names can link its error summary to the fields (spec §9).
 * `email` -> `email`, `user[email]` -> `user-email`, `items[0].qty` -> `items-0-qty`.
 */
export function fieldId(name: string): string {
  const id = name.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return id === '' ? 'field' : id
}

/** Wiring a Field hands to the single control inside it. */
export interface FieldContextValue {
  id: string
  name?: string
  hintId?: string
  errorId?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** Wiring a Fieldset hands to the Checkbox / Radio / Switch options inside it. */
export interface ChoiceGroupContextValue {
  name?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const ChoiceGroupContext = createContext<ChoiceGroupContextValue | null>(null)

interface ControlProps {
  id?: string
  name?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
}

/** Merge a control's own props with the enclosing Field's wiring. Explicit props win. */
export function useFieldControl(props: ControlProps) {
  const field = useContext(FieldContext)
  const invalid = Boolean(props.invalid ?? field?.invalid)
  return {
    id: props.id ?? field?.id,
    name: props.name ?? field?.name,
    required: props.required ?? (field?.required || undefined),
    disabled: props.disabled ?? (field?.disabled || undefined),
    'aria-describedby': joinIds(field?.hintId, field?.errorId, props['aria-describedby']),
    'aria-invalid': invalid ? true : props['aria-invalid'],
  }
}
