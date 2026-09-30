import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../display/cx'
import { normalizeTone, type Tone, type ToneName } from '../display/tone'
import { Alert, type AlertProps } from './Alert'

/**
 * A server flash message. Matches the NIL `nil_flash` cookie (`{ type, message }`, type success |
 * error | info | warning) and portal toasts (`tone` success | error | info).
 */
export interface Flash {
  type?: string
  tone?: string
  title?: ReactNode
  message: ReactNode
}

export interface FlashBannerProps extends Omit<AlertProps, 'tone' | 'title' | 'children'> {
  /** The flash to show. `null`/`undefined` renders nothing, so the server can pass it straight through. */
  flash?: Flash | null
  /** Alternative to `flash`: explicit tone plus children. */
  tone?: ToneName
  title?: ReactNode
  children?: ReactNode
  /**
   * Move focus to the banner after mount (it gets tabIndex=-1), so keyboard and screen-reader users
   * land on the result of a POST-redirect. Default: true for errors, false otherwise.
   */
  focusOnMount?: boolean
}

const FLASH_TYPES: Record<string, Tone> = {
  success: 'ok',
  ok: 'ok',
  error: 'danger',
  danger: 'danger',
  warning: 'warn',
  warn: 'warn',
  info: 'info',
  notice: 'info',
}

/** Map a flash `type`/`tone` string to a tone. Unknown values are info. */
export function flashTone(type: string | undefined | null): Tone {
  if (!type) return 'info'
  return FLASH_TYPES[type] ?? normalizeTone(type, 'info')
}

/**
 * Page-level banner for server flash messages after a POST-redirect (spec §7 P0). role=status, or
 * role=alert for errors. Renders complete on the server; no JS is needed to see it.
 */
export function FlashBanner({ flash, tone, title, children, focusOnMount, className, ...rest }: FlashBannerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const message = flash ? flash.message : children
  const t = flash ? flashTone(flash.type ?? flash.tone) : normalizeTone(tone, 'info')
  const shouldFocus = focusOnMount ?? t === 'danger'
  const present = message !== null && message !== undefined && message !== ''

  useEffect(() => {
    if (present && shouldFocus) ref.current?.focus()
  }, [present, shouldFocus])

  if (!present) return null
  return (
    <Alert {...rest} ref={ref} tone={t} title={flash?.title ?? title} className={cx('ui-flash', className)} tabIndex={-1}>
      {message}
    </Alert>
  )
}
