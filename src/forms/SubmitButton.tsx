import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button, type ButtonProps } from '../actions/Button'
import { mergeRefs } from '../actions/internal'

export interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'loading'> {
  /** Force the pending state (e.g. from your own fetch handler). */
  pending?: boolean
  /** Accessible name while pending, e.g. "Saving…". */
  pendingLabel?: string
}

/**
 * A native `<button type="submit">` (works with JavaScript disabled). Once hydrated it:
 * - shows the loading state after its form submits natively, or while a React form action is
 *   pending (useFormStatus), which blocks double submits without removing the button's value;
 * - re-enables on `pageshow`, so a page restored from the back/forward cache is usable again.
 */
export function SubmitButton({ pending, pendingLabel, variant = 'primary', ref, ...rest }: SubmitButtonProps) {
  const status = useFormStatus()
  const [submitted, setSubmitted] = useState(false)
  const own = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const form = own.current?.form ?? null
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const onSubmit = (event: Event) => {
      // Wait until every other submit handler (including React's delegated onSubmit) has run:
      // a prevented submit (client validation, fetch, React action) is not a navigation.
      const timer = setTimeout(() => {
        timers.delete(timer)
        if (!event.defaultPrevented) setSubmitted(true)
      }, 0)
      timers.add(timer)
    }
    const onPageShow = () => setSubmitted(false)
    form?.addEventListener('submit', onSubmit)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      form?.removeEventListener('submit', onSubmit)
      window.removeEventListener('pageshow', onPageShow)
      timers.forEach(clearTimeout)
    }
  }, [])

  const isPending = Boolean(pending) || status.pending || submitted
  return <Button {...rest} ref={mergeRefs(own, ref)} type="submit" variant={variant} loading={isPending} loadingLabel={pendingLabel} />
}
