import type { ReactNode } from 'react'
import { cx } from '../actions/internal'
import { normalizeTone, TONE_LABEL, type ToneName } from '../display/tone'

export interface TimelineEvent {
  title: ReactNode
  /** The time as the reader should see it, already formatted for their zone ("Oct 3, 2:15 PM"). */
  timeLabel?: string
  /** Machine-readable time (ISO 8601) for the `<time>` element. */
  dateTime?: string
  description?: ReactNode
  /** Status colour of the marker. Non-neutral tones also add a screen-reader word ("Error: "). */
  tone?: ToneName
  /** A small icon in the marker (decorative). */
  icon?: ReactNode
}

export interface TimelineProps {
  events: ReadonlyArray<TimelineEvent>
  /** Names the list ("Activity"). Required. */
  label: string
  className?: string
}

/**
 * A vertical history of events (spec §7 P1 Timeline), in the order given: pass newest first for an
 * activity feed, oldest first for a process. Times arrive as props already formatted (the package does
 * no timezone work). Each marker's tone is repeated in screen-reader text, so status is not colour alone.
 */
export function Timeline({ events, label, className }: TimelineProps) {
  return (
    <ol className={cx('ui-timeline', className)} aria-label={label}>
      {events.map((e, i) => {
        const tone = normalizeTone(e.tone)
        return (
          <li key={i} className="ui-timeline__item ui-tone" data-tone={tone}>
            <span className="ui-timeline__marker" aria-hidden="true">
              {e.icon}
            </span>
            <div className="ui-timeline__body">
              <p className="ui-timeline__title">
                {tone !== 'neutral' ? <span className="ui-visually-hidden">{`${TONE_LABEL[tone]}: `}</span> : null}
                {e.title}
              </p>
              {e.timeLabel ? (
                <time className="ui-timeline__time" {...(e.dateTime ? { dateTime: e.dateTime } : {})}>
                  {e.timeLabel}
                </time>
              ) : null}
              {e.description ? <div className="ui-timeline__description">{e.description}</div> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
