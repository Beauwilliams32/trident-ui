import { useContext, useId, type InputHTMLAttributes, type OptionHTMLAttributes, type ReactNode, type Ref, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cx, joinIds } from '../actions/internal'
import { ChoiceGroupContext, useFieldControl } from './context'
import { FieldErrorText } from './Field'

type AriaInvalid = InputHTMLAttributes<HTMLInputElement>['aria-invalid']

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date' | 'datetime-local' | 'time' | 'month' | 'week' | 'color' | 'file'
  /** Marks the control invalid (aria-invalid). Inside a Field, the Field's error does this. */
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

/** Native `<input>`. Picks up id, name, required, aria-describedby and aria-invalid from Field. */
export function Input({ type = 'text', invalid, className, ref, ...rest }: InputProps) {
  const wired = useFieldControl({ ...rest, invalid })
  return <input {...rest} {...wired} ref={ref} type={type} className={cx('ui-input', className)} />
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

/** Native `<textarea>`, wired like Input. */
export function Textarea({ invalid, rows = 4, className, ref, ...rest }: TextareaProps) {
  const wired = useFieldControl({ ...rest, invalid })
  return <textarea {...rest} {...wired} ref={ref} rows={rows} className={cx('ui-input', 'ui-textarea', className)} />
}

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Options as data. Alternatively pass `<option>` children. */
  options?: ReadonlyArray<SelectOption>
  /** First, empty-valued option ("Choose…"). Disabled when the select is required. */
  placeholder?: string
  invalid?: boolean
  ref?: Ref<HTMLSelectElement>
}

/**
 * Native `<select>` (spec §7: native everywhere in the root entry; the Radix select belongs to the
 * `/app` entry for desktop app surfaces). Works without JavaScript.
 */
export function Select({ options, placeholder, invalid, className, children, ref, ...rest }: SelectProps) {
  const wired = useFieldControl({ ...rest, invalid })
  const uncontrolled = rest.value === undefined && rest.defaultValue === undefined
  const defaultValue = placeholder !== undefined && uncontrolled && !rest.multiple ? '' : rest.defaultValue
  return (
    <span className={cx('ui-select', className)}>
      <select {...rest} {...wired} ref={ref} defaultValue={defaultValue} className="ui-input ui-select__control">
        {placeholder !== undefined ? (
          <option value="" disabled={Boolean(wired.required)}>
            {placeholder}
          </option>
        ) : null}
        {options?.map((o) => (
          <Option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </Option>
        ))}
        {children}
      </select>
      <ChevronDown className="ui-select__icon" size={18} strokeWidth={2} aria-hidden="true" focusable="false" />
    </span>
  )
}

function Option(props: OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />
}

interface ChoiceBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  /** Visible label, rendered as `<label for>`. */
  label: ReactNode
  hint?: ReactNode
  /** Inline error for a standalone option (e.g. "You must accept the terms"). */
  error?: ReactNode
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

function useChoice(props: ChoiceBaseProps) {
  const group = useContext(ChoiceGroupContext)
  const autoId = useId()
  const id = props.id ?? autoId
  const hasError = props.error !== undefined && props.error !== null && props.error !== false && props.error !== ''
  const hintId = props.hint ? `${id}-hint` : undefined
  const errorId = hasError ? `${id}-error` : undefined
  const invalid = Boolean(props.invalid ?? (hasError || group?.invalid))
  return {
    id,
    hasError,
    hintId,
    errorId,
    attrs: {
      id,
      name: props.name ?? group?.name,
      required: props.required ?? (group?.required || undefined),
      disabled: props.disabled ?? (group?.disabled || undefined),
      'aria-describedby': joinIds(hintId, errorId, props['aria-describedby']),
      'aria-invalid': (invalid ? true : props['aria-invalid']) as AriaInvalid,
    },
  }
}

function ChoiceText({ id, label, hint, hintId, error, errorId, hasError }: { id: string; label: ReactNode; hint?: ReactNode; hintId?: string; error?: ReactNode; errorId?: string; hasError: boolean }) {
  return (
    <>
      <label className="ui-choice__label" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="ui-choice__hint">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <FieldErrorText id={errorId} className="ui-choice__error">
          {error}
        </FieldErrorText>
      ) : null}
    </>
  )
}

export type CheckboxProps = ChoiceBaseProps

/** Native checkbox with a token-styled box. Submits `name=value` (default "on") without JS. */
export function Checkbox(props: CheckboxProps) {
  const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props
  const c = useChoice(props)
  return (
    <div className={cx('ui-choice', 'ui-choice--checkbox', className)}>
      <span className="ui-choice__control">
        <input {...rest} {...c.attrs} ref={ref} type="checkbox" className="ui-choice__input" />
        <span className="ui-choice__box" aria-hidden="true">
          <Check className="ui-choice__mark" size={14} strokeWidth={3} focusable="false" />
        </span>
      </span>
      <ChoiceText id={c.id} label={label} hint={hint} hintId={c.hintId} error={error} errorId={c.errorId} hasError={c.hasError} />
    </div>
  )
}

export interface RadioProps extends ChoiceBaseProps {
  /** Submitted value for this option. */
  value: string
}

/** Native radio. Put several inside a Fieldset (which supplies the shared name and legend). */
export function Radio(props: RadioProps) {
  const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props
  const c = useChoice(props)
  return (
    <div className={cx('ui-choice', 'ui-choice--radio', className)}>
      <span className="ui-choice__control">
        <input {...rest} {...c.attrs} ref={ref} type="radio" className="ui-choice__input" />
        <span className="ui-choice__box" aria-hidden="true">
          <span className="ui-choice__dot" />
        </span>
      </span>
      <ChoiceText id={c.id} label={label} hint={hint} hintId={c.hintId} error={error} errorId={c.errorId} hasError={c.hasError} />
    </div>
  )
}

export type SwitchProps = ChoiceBaseProps

/**
 * An on/off switch: a native checkbox with role="switch", so it submits like a checkbox without
 * JavaScript and is announced as a switch. State is shown by thumb position, not colour alone.
 */
export function Switch(props: SwitchProps) {
  const { label, hint, error, invalid: _invalid, className, ref, ...rest } = props
  const c = useChoice(props)
  return (
    <div className={cx('ui-choice', 'ui-choice--switch', className)}>
      <span className="ui-choice__control ui-switch">
        <input {...rest} {...c.attrs} ref={ref} type="checkbox" role="switch" className="ui-choice__input" />
        <span className="ui-switch__track" aria-hidden="true">
          <span className="ui-switch__thumb" />
        </span>
      </span>
      <ChoiceText id={c.id} label={label} hint={hint} hintId={c.hintId} error={error} errorId={c.errorId} hasError={c.hasError} />
    </div>
  )
}
