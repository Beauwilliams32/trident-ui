import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import type { Tone } from './tone'

/**
 * Lifecycle states. Portal (`_ds_bundle.js`): draft, review, scheduled, published, connected, failed,
 * warning. Quorum status meanings (spec §2.2): live, attention, ok, error, reasoning.
 */
export type Status =
  | 'draft'
  | 'review'
  | 'scheduled'
  | 'published'
  | 'connected'
  | 'failed'
  | 'warning'
  | 'live'
  | 'attention'
  | 'ok'
  | 'error'
  | 'reasoning'

interface StatusDef {
  tone: Tone | 'reasoning'
  text: string
}

export const STATUS_MAP: Record<Status, StatusDef> = {
  draft: { tone: 'neutral', text: 'Draft' },
  review: { tone: 'accent', text: 'In review' },
  scheduled: { tone: 'accent', text: 'Scheduled' },
  published: { tone: 'ok', text: 'Published' },
  connected: { tone: 'ok', text: 'Connected' },
  failed: { tone: 'danger', text: 'Failed' },
  warning: { tone: 'warn', text: 'Needs attention' },
  live: { tone: 'accent', text: 'Live' },
  attention: { tone: 'warn', text: 'Attention' },
  ok: { tone: 'ok', text: 'OK' },
  error: { tone: 'danger', text: 'Error' },
  reasoning: { tone: 'reasoning', text: 'Reasoning' },
}

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  /** Unknown values render as draft, matching the portal component. */
  status?: Status | (string & {})
  /** Overrides the default text for the status. The pill always shows text. */
  label?: ReactNode
}

/**
 * Pill with a leading status dot (spec §7 P0; portal `_ds_bundle.js` StatusPill). The dot is
 * decorative (aria-hidden); the text carries the meaning. It does not animate: "live" is a label for a
 * value the caller already knows is live (spec §6.3 rule 9), not an indicator this component invents.
 */
export function StatusPill({ status = 'draft', label, className, ...rest }: StatusPillProps) {
  const key = (status in STATUS_MAP ? status : 'draft') as Status
  const def = STATUS_MAP[key]
  return (
    <span {...rest} className={cx('ui-status', 'ui-tone', className)} data-tone={def.tone} data-status={key}>
      <span className="ui-status__dot" aria-hidden="true" />
      {label ?? def.text}
    </span>
  )
}
