import { useId, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, type CardProps } from './Card'
import { cx } from './cx'
import { normalizeTone, type ToneName } from './tone'

export type TrendDir = 'up' | 'down' | 'flat'

export interface StatTrend {
  dir: TrendDir
  /** Visible change, e.g. "+12%". */
  value: ReactNode
  /** Optional context, e.g. "vs last week". */
  note?: ReactNode
  /** Override the colour (e.g. `ok` when "down" is good, like churn). Default up=ok, down=danger, flat=neutral. */
  tone?: ToneName
}

export interface StatCardProps extends Omit<CardProps, 'children'> {
  label: ReactNode
  /**
   * The real value, from an API or props (spec §6.3 rule 9). Numbers are formatted with `locale`.
   * `null`/`undefined` renders an honest "no data" dash, never a placeholder number.
   */
  value: ReactNode | number | null | undefined
  /** Secondary line, shown when there is no trend (portal behaviour). */
  sub?: ReactNode
  trend?: StatTrend
  /** Number formatting. Fixed default so server and client render identical text. */
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  /**
   * Opt in to a motion-lite count-up. SSR still renders the final formatted value as text; this only
   * adds `data-count-to` for motion-lite's CountUp (which honours reduced motion and Pause) to enhance.
   */
  countUp?: boolean
}

const TREND_TEXT: Record<TrendDir, string> = { up: 'Up', down: 'Down', flat: 'No change' }
const TREND_TONE = { up: 'ok', down: 'danger', flat: 'neutral' } as const

/**
 * KPI tile (spec §7 P0; portal `_ds_bundle.js` StatCard: label, value, sub, trend {dir, value, note}).
 * Real values only, and the server-rendered HTML already holds the final value.
 */
export function StatCard({
  label,
  value,
  sub,
  trend,
  locale = 'en-US',
  formatOptions,
  countUp = false,
  className,
  ...rest
}: StatCardProps) {
  const labelId = useId()
  const isNumber = typeof value === 'number' && Number.isFinite(value)
  const empty = value === null || value === undefined || value === '' || (typeof value === 'number' && !Number.isFinite(value))
  const text = isNumber ? new Intl.NumberFormat(locale, formatOptions).format(value) : value
  const dir: TrendDir = trend && trend.dir in TREND_TEXT ? trend.dir : 'flat'
  const TrendIcon = dir === 'up' ? ArrowUp : dir === 'down' ? ArrowDown : Minus

  return (
    <Card {...rest} className={cx('ui-stat', className)} role="group" aria-labelledby={labelId}>
      <p className="ui-stat__label" id={labelId}>
        {label}
      </p>
      <p className="ui-stat__value ui-tabular" data-count-to={countUp && isNumber ? String(value) : undefined}>
        {empty ? (
          <>
            <span aria-hidden="true">—</span>
            <span className="ui-visually-hidden">No data</span>
          </>
        ) : (
          (text as ReactNode)
        )}
      </p>
      {trend ? (
        <p className="ui-stat__trend ui-tone" data-tone={normalizeTone(trend.tone, TREND_TONE[dir])} data-dir={dir}>
          <TrendIcon aria-hidden="true" size={14} strokeWidth={2.5} />
          <span className="ui-visually-hidden">{TREND_TEXT[dir]} </span>
          <span>{trend.value}</span>
          {trend.note ? <span className="ui-stat__note">{trend.note}</span> : null}
        </p>
      ) : sub ? (
        <p className="ui-stat__sub">{sub}</p>
      ) : null}
    </Card>
  )
}
