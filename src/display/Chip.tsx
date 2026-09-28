import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from './cx'
import { normalizeTone, type ToneName } from './tone'

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  /** Visible label. Required: a chip is never colour alone. */
  children: ReactNode
  tone?: ToneName
  /** Optional leading icon; rendered aria-hidden. */
  icon?: ReactNode
  /**
   * Makes the chip a toggle: the label becomes a `<button type="button" aria-pressed>`.
   * Pass `selected` to reflect state.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>
  selected?: boolean
  /** Adds a trailing remove button (at least 24x24, WCAG 2.5.8). */
  onRemove?: MouseEventHandler<HTMLButtonElement>
  /** Accessible name of the remove button. Default: "Remove <label>" when the label is a string. */
  removeLabel?: string
  disabled?: boolean
}

/**
 * Compact tag for filters and selections (spec §7 P0). Static by default; `onClick` turns it into a
 * toggle button and `onRemove` adds a separate remove button, so each control has one job.
 */
export function Chip({
  children,
  tone = 'neutral',
  icon,
  onClick,
  selected,
  onRemove,
  removeLabel,
  disabled,
  className,
  ...rest
}: ChipProps) {
  const t = normalizeTone(tone)
  const content = (
    <>
      {icon ? (
        <span className="ui-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-chip__label">{children}</span>
    </>
  )
  const removeName = removeLabel ?? (typeof children === 'string' || typeof children === 'number' ? `Remove ${children}` : 'Remove')
  return (
    <span
      {...rest}
      className={cx('ui-chip', 'ui-tone', className)}
      data-tone={t}
      data-selected={selected ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      {onClick ? (
        <button type="button" className="ui-chip__toggle" aria-pressed={selected ?? false} onClick={onClick} disabled={disabled}>
          {content}
        </button>
      ) : (
        content
      )}
      {onRemove ? (
        <button type="button" className="ui-chip__remove" aria-label={removeName} onClick={onRemove} disabled={disabled}>
          <X aria-hidden="true" size={14} strokeWidth={2.25} />
        </button>
      ) : null}
    </span>
  )
}
