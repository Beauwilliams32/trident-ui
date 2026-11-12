import type { ComponentType, ReactNode } from 'react'
import { cx } from '../actions/internal'

export interface Fact {
  /** A lucide-react icon component (decorative). */
  icon?: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' }>
  title: string
  body?: ReactNode
}

export interface FactStripProps {
  /** Names the list for screen readers ("What you can count on"). */
  label: string
  facts: ReadonlyArray<Fact>
  className?: string
}

/**
 * A trust strip between the hero and the features: short facts the product can back. Every line
 * must be true and checkable (a test in the consuming repo should pin each one); there are no logos,
 * counts or testimonials here, so nothing in this component can imply adoption that has not happened.
 */
export function FactStrip({ label, facts, className }: FactStripProps) {
  return (
    <ul className={cx('ui-facts', className)} aria-label={label}>
      {facts.map(({ icon: Icon, title, body }) => (
        <li key={title} className="ui-fact">
          {Icon ? (
            <span className="ui-fact__icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          ) : null}
          <span className="ui-fact__text">
            <strong>{title}</strong>
            {body ? <span>{body}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
