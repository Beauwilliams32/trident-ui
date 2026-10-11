/**
 * @trident/ui — forms group (spec §7): native-POST-first forms that work with JavaScript disabled.
 * Re-exported from the package root (src/index.ts). Component CSS lives in src/forms/styles.css.
 */
export { Form, CsrfField, DEFAULT_CSRF_FIELD } from './Form'
export type { FormProps, CsrfFieldProps } from './Form'
export { Field, Fieldset, FieldErrorText } from './Field'
export type { FieldProps, FieldsetProps } from './Field'
export { Input, Textarea, Select, Checkbox, Radio, Switch } from './controls'
export type { InputProps, TextareaProps, SelectProps, SelectOption, CheckboxProps, RadioProps, SwitchProps } from './controls'
export { FormError } from './FormError'
export type { FormErrorProps } from './FormError'
export { SubmitButton } from './SubmitButton'
export type { SubmitButtonProps } from './SubmitButton'
export { ErrorSummary } from './ErrorSummary'
export type { ErrorSummaryProps, ErrorSummaryItem } from './ErrorSummary'
export { fieldId, useFieldControl } from './context'
export { errorTitle, errorCount } from './errorTitle'
export type { ErrorCountInput } from './errorTitle'
