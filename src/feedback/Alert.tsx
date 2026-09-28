import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { X } from 'lucide-react'
import { cx } from '../display/cx'
import { TONE_LABEL, normalizeTone, type ToneName } from '../display/tone'
import { ToneIcon, liveRoleFor } from './tone-icon'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** info (default), ok/success, warn/warning, danger/error. */
  tone?: ToneName
  title?: ReactNode
  children?: ReactNode
  /** Custom icon, or `false` for none. Icons are always aria-hidden. */
  icon?: ReactNode | false
  /** Optional actions (links or buttons) under the message. */
  actions?: ReactNode
  /** Adds a dismiss button. */
  onDismiss?: () => void
  dismissLabel?: string
  /**
   * `true` (default) sets role=alert for danger and role=status otherwise. Set `false` for static
   * content that is already on the page at load and should not be announced (no role).
   */
  live?: boolean
  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Inline message (spec §7 P0). The tone is always carried by text as well as colour: the title, or a
 * visually hidden "Error:" / "Warning:" prefix when there is no title.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  icon,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  live = true,
  className,
  role,
  ref,
  ...rest
}: AlertProps) {
  const t = normalizeTone(tone, 'info')
  return (
    <div {...rest} ref={ref} role={role ?? (live ? liveRoleFor(t) : undefined)} className={cx('ui-alert', 'ui-tone', className)} data-tone={t}>
      {icon === false ? null : (
        <span className="ui-alert__icon" aria-hidden="true">
          {icon ?? <ToneIcon tone={t} />}
        </span>
      )}
      <div className="ui-alert__body">
        {title ? <p className="ui-alert__title">{title}</p> : null}
        {children ? (
          <div className="ui-alert__message">
            {title ? null : <span className="ui-visually-hidden">{TONE_LABEL[t]}: </span>}
            {children}
          </div>
        ) : null}
        {actions ? <div className="ui-alert__actions">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="ui-alert__dismiss" aria-label={dismissLabel} onClick={onDismiss}>
          <X aria-hidden="true" size={16} strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  )
}
