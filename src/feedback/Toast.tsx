import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../display/cx'
import { TONE_LABEL, normalizeTone, type ToneName } from '../display/tone'
import { ToneIcon, liveRoleFor } from './tone-icon'

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Portal tones: success (default), error, info; also warning and the canonical names. */
  tone?: ToneName
  title?: ReactNode
  message?: ReactNode
  /** Adds a dismiss button, and is what `duration` calls. */
  onClose?: () => void
  closeLabel?: string
  /**
   * Auto-dismiss after this many ms (needs `onClose`). The timer pauses while the toast is hovered
   * or holds focus, and never runs for errors, which stay until dismissed. Minimum 4000ms.
   */
  duration?: number
}

const MIN_DURATION = 4000

/**
 * CSS toast for islands and SSR pages (spec §7 P0; portal `_ds_bundle.js` Toast: tone, title,
 * message, onClose). No toast library: the enter animation is CSS behind the motion gate. Apps use
 * the sonner wrapper in `@trident/ui/app` instead. role=status, or role=alert for errors.
 */
export function Toast({
  tone = 'success',
  title,
  message,
  onClose,
  closeLabel = 'Dismiss',
  duration,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}: ToastProps) {
  const t = normalizeTone(tone, 'ok')
  const [paused, setPaused] = useState(false)
  const auto = Boolean(onClose && duration && duration > 0 && t !== 'danger')

  useEffect(() => {
    if (!auto || paused || !onClose) return
    const id = setTimeout(onClose, Math.max(MIN_DURATION, duration ?? 0))
    return () => clearTimeout(id)
  }, [auto, paused, onClose, duration])

  return (
    <div
      {...rest}
      role={rest.role ?? liveRoleFor(t)}
      className={cx('ui-toast', 'ui-tone', className)}
      data-tone={t}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        setPaused(true)
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e)
        setPaused(false)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        setPaused(true)
      }}
      onBlur={(e) => {
        onBlur?.(e)
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <span className="ui-toast__icon" aria-hidden="true">
        <ToneIcon tone={t} />
      </span>
      <div className="ui-toast__body">
        {title ? <p className="ui-toast__title">{title}</p> : <span className="ui-visually-hidden">{TONE_LABEL[t]}: </span>}
        {message ? <p className="ui-toast__message">{message}</p> : null}
      </div>
      {onClose ? (
        <button type="button" className="ui-toast__close" aria-label={closeLabel} onClick={onClose}>
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  )
}

export interface ToastRegionProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name of the region. */
  label?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  children?: ReactNode
}

/**
 * Fixed stack that holds toasts (the portal's top-right flash stack). Render it on the server,
 * empty, so it exists before the first toast; each Toast carries its own live role.
 */
export function ToastRegion({ label = 'Notifications', position = 'top-right', className, children, ...rest }: ToastRegionProps) {
  return (
    <section {...rest} aria-label={label} className={cx('ui-toast-region', className)} data-position={position}>
      {children}
    </section>
  )
}
