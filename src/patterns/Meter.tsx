import { useId } from 'react'
import { cx } from '../actions/internal'

export type MeterState = 'good' | 'fair' | 'poor'

export interface MeterProps {
  /** Names what is measured ("Storage used"). Required. */
  label: string
  value: number
  min?: number
  max?: number
  /** Values at or below this are in the low region. */
  low?: number
  /** Values at or above this are in the high region. */
  high?: number
  /**
   * The best value, which decides which region is good: below `low` for "lower is better" (error
   * rate), above `high` for "higher is better" (coverage). Omit for a neutral gauge.
   */
  optimum?: number
  /** Visible value text ("72 GB of 100 GB"). Default "<value> of <max>". */
  valueText?: string
  /** Visible words for each state, so the state is never colour alone. */
  stateLabels?: Partial<Record<MeterState, string>>
  className?: string
}

const STATE_TEXT: Record<MeterState, string> = { good: 'Good', fair: 'Fair', poor: 'Needs attention' }

/**
 * Which region the value is in, by the algorithm browsers use to paint a `<meter>` (HTML spec,
 * Chromium's HTMLMeterElement::GetGaugeRegion), so the word shown agrees with the colour painted.
 * Returns undefined for a neutral gauge (no `optimum`).
 */
export function meterState(value: number, { min = 0, max = 100, low, high, optimum }: Pick<MeterProps, 'min' | 'max' | 'low' | 'high' | 'optimum'>): MeterState | undefined {
  if (optimum === undefined) return undefined
  const clamp = (n: number) => Math.min(Math.max(n, min), max)
  const lo = clamp(low ?? min)
  const hi = Math.max(clamp(high ?? max), lo)
  const opt = clamp(optimum)
  const v = clamp(value)
  if (opt < lo) return v <= lo ? 'good' : v <= hi ? 'fair' : 'poor'
  if (hi < opt) return v >= hi ? 'good' : v >= lo ? 'fair' : 'poor'
  return lo <= v && v <= hi ? 'good' : 'fair'
}

/**
 * A gauge for a known range (spec §7 P1 Meter): a native `<meter>` with its value as text and, when
 * an `optimum` is given, a state word ("Good", "Fair", "Needs attention") beside it. Use a Meter for
 * a measurement (storage used, score) and a ProgressBar for a task that is moving toward done.
 */
export function Meter({ label, value, min = 0, max = 100, low, high, optimum, valueText, stateLabels, className }: MeterProps) {
  const id = useId()
  const state = meterState(value, { min, max, low, high, optimum })
  const words = { ...STATE_TEXT, ...stateLabels }
  return (
    <div className={cx('ui-meter', className)} data-state={state}>
      <div className="ui-meter__head">
        <span id={id} className="ui-meter__label">
          {label}
        </span>
        <span className="ui-meter__value ui-tabular">
          {valueText ?? `${value} of ${max}`}
          {state ? <span className="ui-meter__state">{words[state]}</span> : null}
        </span>
      </div>
      <meter className="ui-meter__bar" value={value} min={min} max={max} low={low} high={high} optimum={optimum} aria-labelledby={id} aria-valuetext={valueText} />
    </div>
  )
}
