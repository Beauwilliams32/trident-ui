import type { ReactNode } from 'react'

/** What errorTitle() can count: a number, or the same errors ErrorSummary takes. */
export type ErrorCountInput = number | ReadonlyArray<{ message: ReactNode }> | Readonly<Record<string, ReactNode>> | null | undefined

const isEmpty = (m: ReactNode) => m === undefined || m === null || m === false || m === ''

/** How many errors ErrorSummary would list for `errors` (empty messages are skipped, as there). */
export function errorCount(errors: ErrorCountInput): number {
  if (errors === null || errors === undefined) return 0
  if (typeof errors === 'number') return Number.isFinite(errors) && errors > 0 ? Math.floor(errors) : 0
  const messages = Array.isArray(errors) ? (errors as ReadonlyArray<{ message: ReactNode }>).map((e) => e.message) : Object.values(errors)
  return messages.filter((m) => !isEmpty(m)).length
}

/**
 * The page `<title>` after a failed form POST (GOV.UK error summary pattern): "Error: <title>" when
 * there is at least one error, so screen-reader users hear the failure as soon as the page loads.
 * With no errors the title comes back unchanged. Pass the same `errors` you give ErrorSummary.
 *
 *   <title>{errorTitle('Your profile | Trident NIL', errors)}</title>
 */
export function errorTitle(title: string, errors: ErrorCountInput, prefix = 'Error'): string {
  return errorCount(errors) > 0 ? `${prefix}: ${title}` : title
}
