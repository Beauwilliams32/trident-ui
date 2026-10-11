import { useId, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Card } from '../display/Card'
import { Section } from '../layout/Section'
import { Heading } from '../type/Heading'
import { Text } from '../type/Text'

export interface Feature {
  /** A lucide-react icon component (decorative). */
  icon?: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' }>
  title: string
  body: ReactNode
}

export interface FeatureGridProps {
  heading: ReactNode
  /** Keep the heading for screen readers only (the hero already introduces the list). */
  headingHidden?: boolean
  intro?: ReactNode
  features: ReadonlyArray<Feature>
  /** Opt into motion-lite reveals with a 70ms stagger (static without JS). Default true. */
  reveal?: boolean
  tone?: 'default' | 'alt' | 'surface'
  className?: string
}

/** A grid of feature cards: icon tile, title, one or two sentences (spec §7 P1 FeatureGrid). */
export function FeatureGrid({ heading, headingHidden = false, intro, features, reveal = true, tone = 'default', className }: FeatureGridProps) {
  const id = useId()
  return (
    <Section space="lg" tone={tone} aria-labelledby={id} className={cx('ui-features', className)}>
      <div className="ui-marketing__head">
        <Heading level={2} size="3xl" id={id} className={headingHidden ? 'ui-visually-hidden' : undefined}>
          {heading}
        </Heading>
        {intro ? <Text tone="muted">{intro}</Text> : null}
      </div>
      <ul className="ui-features__list">
        {features.map(({ icon: Icon, title, body }, i) => (
          <li key={title} {...(reveal ? { 'data-reveal': '', style: { '--i': i } as CSSProperties } : {})}>
            <Card padding="md" className="ui-feature">
              {Icon ? (
                <span className="ui-feature__icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                </span>
              ) : null}
              <Heading level={3} size="lg">
                {title}
              </Heading>
              <Text size="sm" tone="muted">
                {body}
              </Text>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  )
}
