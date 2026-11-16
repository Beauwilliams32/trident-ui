import { useId } from 'react'
import { cx } from '../actions/internal'
import { normalizeTone, type ToneName } from '../display/tone'

export interface ProgressBarProps {
  /** Names what is progressing ("Uploading 3 of 8 files"). Required: it is the accessible name. */
  label: string
  /** Current amount, from 0 to `max`. Omit when the length of the wait is unknown: the bar then shows "In progress". */
  value?: number
  max?: number
  /** Show the percentage next to the label. Default true when `value` is given. */
  showValue?: boolean
  /** Replaces the percentage as visible text and as `aria-valuetext` ("3 of 8 files"). */
  valueText?: string
  /** Colour of the fill. Default "accent". The value or the label already says the same in text. */
  tone?: ToneName
  size?: 'sm' | 'md'
  /** The visible words while the amount is unknown. Default "In progress". */
  indeterminateText?: string
  className?: string
}

/**
 * A progress bar (spec §7 P1 ProgressBar). With a value it is a native `<progress>`; without one it
 * is an indeterminate `role="progressbar"` that says "In progress" in text and sweeps only when motion
 * is allowed (under Reduce Motion or Pause it is a static partial bar). Prefer a determinate bar:
 * "3 of 8" tells people more than movement does.
 */
export function ProgressBar({ label, value, max = 100, showValue, valueText, tone = 'accent', size = 'md', indeterminateText = 'In progress', className }: ProgressBarProps) {
  const id = useId()
  const t = normalizeTone(tone, 'accent')
  const determinate = typeof value === 'number' && Number.isFinite(value)
  const clamped = determinate ? Math.min(Math.max(value, 0), max) : undefined
  const text = valueText ?? (clamped === undefined ? indeterminateText : `${Math.round((clamped / max) * 100)}%`)
  const visible = clamped === undefined || (showValue ?? true)
  return (
    <div className={cx('ui-progress', 'ui-tone', className)} data-tone={t} data-size={size} data-state={determinate ? 'determinate' : 'indeterminate'}>
      <div className="ui-progress__head">
        <span id={id} className="ui-progress__label">
          {label}
        </span>
        {visible ? <span className="ui-progress__value ui-tabular">{text}</span> : null}
      </div>
      {clamped === undefined ? (
        <div className="ui-progress__bar ui-progress__bar--indeterminate" role="progressbar" aria-labelledby={id} aria-valuetext={indeterminateText}>
          <span className="ui-progress__sweep" />
        </div>
      ) : (
        <progress className="ui-progress__bar" value={clamped} max={max} aria-labelledby={id} aria-valuetext={valueText} />
      )}
    </div>
  )
}
