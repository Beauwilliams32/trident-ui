import { useId, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cx } from '../actions/internal'
import { Badge } from '../display/Badge'
import { Card } from '../display/Card'
import { Section } from '../layout/Section'
import { Heading } from '../type/Heading'
import { Text } from '../type/Text'

export interface PricingPlan {
  id: string
  name: string
  /**
   * The price exactly as the pricing canon states it ("$49", "Free"). Never computed, rounded or
   * defaulted here: this component renders what it is given (spec §7, §6.3 rule 9).
   */
  price: string
  /** "/month", "per seat", ... */
  period?: string
  blurb?: ReactNode
  features?: ReadonlyArray<ReactNode>
  /** Mark the recommended plan (accent border plus the `badge` text, never colour alone). */
  highlight?: boolean
  /** The plan's action, rendered in static markup (a LinkButton to checkout). */
  cta?: ReactNode
}

export interface PricingTableProps {
  heading: ReactNode
  sub?: ReactNode
  plans: ReadonlyArray<PricingPlan>
  /** Text of the badge on highlighted plans, e.g. "Most popular". Required if any plan is highlighted. */
  badge?: ReactNode
  /** Alternative to `plan.cta`. */
  renderCta?: (plan: PricingPlan) => ReactNode
  /** Small print under the plans (taxes, trial terms), from the same canon as the prices. */
  note?: ReactNode
  tone?: 'default' | 'alt' | 'surface'
  className?: string
}

/**
 * Plan cards for a pricing section (spec §7 P1 PricingTable). A money surface (spec §6.8): it sets
 * data-surface="money", so Lazy3D refuses to mount inside it, and it has no reveal or count-up.
 * Prices come only from props.
 */
export function PricingTable({ heading, sub, plans, badge, renderCta, note, tone = 'alt', className }: PricingTableProps) {
  const id = useId()
  return (
    <Section space="lg" tone={tone} aria-labelledby={id} data-surface="money" className={cx('ui-pricing', className)}>
      <div className="ui-marketing__head" data-align="center">
        <Heading level={2} size="3xl" id={id}>
          {heading}
        </Heading>
        {sub ? <Text tone="muted">{sub}</Text> : null}
      </div>
      <ul className="ui-pricing__plans">
        {plans.map((plan) => (
          <li key={plan.id}>
            <Card padding="lg" accent={Boolean(plan.highlight)} className="ui-plan" data-highlight={plan.highlight ? '' : undefined}>
              <div className="ui-plan__head">
                <Heading level={3} size="lg">
                  {plan.name}
                </Heading>
                {plan.highlight && badge ? (
                  <Badge tone="accent" size="sm">
                    {badge}
                  </Badge>
                ) : null}
              </div>
              <p className="ui-plan__price ui-tabular">
                {plan.price}
                {plan.period ? <span className="ui-plan__period">{plan.period}</span> : null}
              </p>
              {plan.blurb ? (
                <Text size="sm" tone="muted">
                  {plan.blurb}
                </Text>
              ) : null}
              {plan.features?.length ? (
                <ul className="ui-plan__features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <Check size={16} aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="ui-plan__cta">{renderCta ? renderCta(plan) : plan.cta}</div>
            </Card>
          </li>
        ))}
      </ul>
      {note ? (
        <Text size="sm" tone="muted" className="ui-pricing__note">
          {note}
        </Text>
      ) : null}
    </Section>
  )
}
