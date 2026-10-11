import { useId, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Section } from '../layout/Section'
import { Heading } from '../type/Heading'
import { Text } from '../type/Text'

export interface CtaBandProps {
  heading: ReactNode
  body?: ReactNode
  /** One action (a LinkButton). */
  action: ReactNode
  reveal?: boolean
  className?: string
}

/** A closing call to action: heading, one sentence, one action (spec §7 P1 CtaBand). */
export function CtaBand({ heading, body, action, reveal = true, className }: CtaBandProps) {
  const id = useId()
  return (
    <Section space="md" aria-labelledby={id} className={cx('ui-cta-band', className)}>
      <div className="ui-cta-band__panel" {...(reveal ? { 'data-reveal': '' } : {})}>
        <div className="ui-cta-band__copy">
          <Heading level={2} size="2xl" id={id}>
            {heading}
          </Heading>
          {body ? <Text tone="ink-2">{body}</Text> : null}
        </div>
        <div className="ui-cta-band__action">{action}</div>
      </div>
    </Section>
  )
}
