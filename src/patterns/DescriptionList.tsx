import type { ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface DescriptionItem {
  term: ReactNode
  description: ReactNode
  /** Set the value in the monospace face (ids, hashes, amounts in code). */
  mono?: boolean
}

export interface DescriptionListProps {
  items: ReadonlyArray<DescriptionItem>
  /**
   * "stacked" (default): term above value. "inline": two columns from 520px, term left. Use inline for
   * a record's details; stacked inside narrow cards.
   */
  layout?: 'stacked' | 'inline'
  /** Hairlines between rows. Default false. */
  dividers?: boolean
  className?: string
}

/**
 * Key-value pairs (spec §7 P1 DescriptionList / KeyValue) as a real `<dl>`, so a screen reader
 * announces "term, definition". Use it for a record's details: owner, plan, created. A missing value
 * is the caller's to write ("Not set"); nothing here fills a blank with a placeholder.
 */
export function DescriptionList({ items, layout = 'stacked', dividers = false, className }: DescriptionListProps) {
  return (
    <dl className={cx('ui-dl', className)} data-layout={layout} data-dividers={dividers ? '' : undefined}>
      {items.map((it, i) => (
        <div key={i} className="ui-dl__row">
          <dt>{it.term}</dt>
          <dd data-mono={it.mono ? '' : undefined}>{it.description}</dd>
        </div>
      ))}
    </dl>
  )
}
