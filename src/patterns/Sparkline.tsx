import { cx } from '../actions/internal'
import { normalizeTone, type ToneName } from '../display/tone'

export interface SparklineProps {
  /** The series, oldest first. Real values only; fewer than two shows `emptyLabel`. */
  values: ReadonlyArray<number>
  /** What the line shows, with its period: "Posts per day, last 14 days". Required. */
  label: string
  /** Replaces the generated summary ("from 12 to 31; low 9, high 34"). */
  summary?: string
  tone?: ToneName
  /** Fill the area under the line. Default false. */
  area?: boolean
  /** Drawn size in px. Default 96 by 28. */
  width?: number
  height?: number
  /** Number formatting for the summary. Default "en-US". */
  locale?: string
  /** Text when there is nothing to draw. Default "No data yet". */
  emptyLabel?: string
  className?: string
}

/**
 * A tiny trend line (spec §7 P1 Sparkline) as an inline SVG polyline. It is a picture with a text
 * equivalent: the label and a summary of first, last, low and high values are its accessible name,
 * so the trend is never only a shape. It draws exactly the values given and never smooths or invents any.
 */
export function Sparkline({ values, label, summary, tone = 'accent', area = false, width = 96, height = 28, locale = 'en-US', emptyLabel = 'No data yet', className }: SparklineProps) {
  const t = normalizeTone(tone, 'accent')
  const clean = values.filter((v) => Number.isFinite(v))
  if (clean.length < 2)
    return (
      <span className={cx('ui-sparkline', 'ui-sparkline--empty', className)}>
        <span className="ui-visually-hidden">{label}: </span>
        {emptyLabel}
      </span>
    )
  const lo = Math.min(...clean)
  const hi = Math.max(...clean)
  const span = hi - lo || 1
  const pad = 2
  const x = (i: number) => pad + (i / (clean.length - 1)) * (width - pad * 2)
  const y = (v: number) => (hi === lo ? height / 2 : height - pad - ((v - lo) / span) * (height - pad * 2))
  const points = clean.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  const fmt = (n: number) => n.toLocaleString(locale)
  const text = summary ?? `from ${fmt(clean[0]!)} to ${fmt(clean[clean.length - 1]!)}; low ${fmt(lo)}, high ${fmt(hi)}`
  return (
    <svg
      className={cx('ui-sparkline', 'ui-tone', className)}
      data-tone={t}
      role="img"
      aria-label={`${label}: ${text}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      focusable="false"
    >
      {area ? <polygon className="ui-sparkline__area" points={`${x(0)},${height - pad} ${points} ${x(clean.length - 1)},${height - pad}`} /> : null}
      <polyline className="ui-sparkline__line" points={points} fill="none" />
      <circle className="ui-sparkline__end" cx={x(clean.length - 1)} cy={y(clean[clean.length - 1]!)} r="2.5" />
    </svg>
  )
}
