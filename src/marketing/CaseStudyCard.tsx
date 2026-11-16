import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cx } from '../actions/internal'
import { Card } from '../display/Card'
import { Heading } from '../type/Heading'
import { Kicker } from '../type/Kicker'
import { Text } from '../type/Text'

export interface CaseStudyMetric {
  label: string
  /** A measured value, exactly as the case study states it ("42 posts a week"). Never rounded up. */
  value: string
}

export interface CaseStudyCardProps {
  /** The client or project name. */
  client?: ReactNode
  title: string
  summary: ReactNode
  href: string
  /** A picture (an `<img>` with width, height and alt). */
  image?: ReactNode
  /** Measured results the case study itself reports. */
  metrics?: ReadonlyArray<CaseStudyMetric>
  /** The link text. Default "Read the case study". */
  cta?: string
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4
  className?: string
}

/**
 * A link card to one case study (spec §7 P1 CaseStudyCard). The whole card is one link, named by the
 * title, so there is a single tab stop; the focus ring wraps the card. Results appear only when the
 * linked case study reports them.
 */
export function CaseStudyCard({ client, title, summary, href, image, metrics, cta = 'Read the case study', headingLevel = 3, className }: CaseStudyCardProps) {
  return (
    <Card as="article" interactive padding="none" className={cx('ui-case', className)}>
      {image ? <div className="ui-case__image">{image}</div> : null}
      <div className="ui-case__body">
        {client ? <Kicker>{client}</Kicker> : null}
        <Heading level={headingLevel} size="xl" className="ui-case__title">
          <a className="ui-case__link" href={href}>
            {title}
          </a>
        </Heading>
        <Text size="sm" tone="muted">
          {summary}
        </Text>
        {metrics?.length ? (
          <dl className="ui-case__metrics">
            {metrics.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <span className="ui-case__cta" aria-hidden="true">
          {cta}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Card>
  )
}
