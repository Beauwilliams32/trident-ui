import { useEffect, useId, useRef, type MouseEvent, type ReactNode, type Ref } from 'react'
import { cx, mergeRefs } from '../actions/internal'
import { fieldId } from './context'

export interface ErrorSummaryItem {
  /** Target element id. */
  id?: string
  /** Field name; mapped to an id with fieldId(), matching Field / Fieldset defaults. */
  name?: string
  message: ReactNode
}

export interface ErrorSummaryProps {
  /** Either a list, or a record of field name -> message (empty messages are skipped). */
  errors: ReadonlyArray<ErrorSummaryItem> | Readonly<Record<string, ReactNode>>
  title?: ReactNode
  /** Optional line under the title. */
  description?: ReactNode
  headingLevel?: 2 | 3 | 4
  /** Move focus to the summary when it mounts (after a failed POST). Default true. */
  focusOnMount?: boolean
  id?: string
  className?: string
  ref?: Ref<HTMLDivElement>
}

const isEmpty = (m: ReactNode) => m === undefined || m === null || m === false || m === ''

function normalise(errors: ErrorSummaryProps['errors']): Array<{ href: string; message: ReactNode }> {
  const list: ErrorSummaryItem[] = Array.isArray(errors)
    ? [...(errors as ReadonlyArray<ErrorSummaryItem>)]
    : Object.entries(errors as Record<string, ReactNode>).map(([name, message]) => ({ name, message }))
  return list
    .filter((e) => !isEmpty(e.message))
    .map((e) => ({ href: `#${e.id ?? fieldId(e.name ?? '')}`, message: e.message }))
}

const FOCUSABLE = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Error summary for the top of a form (spec §9: "error summaries link to their fields").
 * Each entry is a real `<a href="#field-id">`, so it works without JavaScript; once hydrated, a
 * click focuses the field (or the first control in a fieldset) and scrolls its label into view.
 */
export function ErrorSummary({ errors, title = 'There is a problem', description, headingLevel = 2, focusOnMount = true, id, className, ref }: ErrorSummaryProps) {
  const items = normalise(errors)
  const headingId = useId()
  const own = useRef<HTMLDivElement | null>(null)
  const count = items.length

  useEffect(() => {
    if (focusOnMount && count > 0) own.current?.focus()
  }, [focusOnMount, count])

  if (count === 0) return null

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    if (!target) return
    const control = target.matches(FOCUSABLE) ? target : target.querySelector<HTMLElement>(FOCUSABLE)
    if (!control) return
    event.preventDefault()
    const container = target.closest('.ui-field, .ui-fieldset, .ui-choice') ?? target
    container.scrollIntoView({ block: 'start' })
    control.focus({ preventScroll: true })
  }

  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <div ref={mergeRefs(own, ref)} id={id} className={cx('ui-error-summary', className)} role="alert" aria-labelledby={headingId} tabIndex={-1}>
      <Heading id={headingId} className="ui-error-summary__title">
        {title}
      </Heading>
      {description ? <p className="ui-error-summary__description">{description}</p> : null}
      <ul className="ui-error-summary__list">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} onClick={(e) => onLinkClick(e, item.href)}>
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
