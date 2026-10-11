import { useId, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Section } from '../layout/Section'
import { faqPage, serializeJsonLd } from '../server/jsonld'
import { Heading } from '../type/Heading'

export interface FaqItem {
  q: string
  /** A string, so the same answer can feed the FAQPage JSON-LD; or rich content without it. */
  a: ReactNode
}

export interface FaqProps {
  heading: ReactNode
  items: ReadonlyArray<FaqItem>
  /**
   * Also emit FAQPage JSON-LD built from the same items (spec §7: the structured data must match
   * the visible FAQ). Only items whose answer is a plain string are included.
   */
  jsonLd?: boolean
  /** Opt into a motion-lite reveal of the list. Default true. */
  reveal?: boolean
  className?: string
}

/** Questions and answers in `<details>` (spec §7 P1 FAQ): works without JavaScript. */
export function Faq({ heading, items, jsonLd = false, reveal = true, className }: FaqProps) {
  const id = useId()
  const structured = items.filter((it): it is { q: string; a: string } => typeof it.a === 'string' && it.a.trim() !== '')
  return (
    <Section space="lg" container="prose" aria-labelledby={id} className={cx('ui-faq', className)}>
      <div className="ui-marketing__head" data-align="center">
        <Heading level={2} size="3xl" id={id}>
          {heading}
        </Heading>
      </div>
      <div className="ui-faq__list" {...(reveal ? { 'data-reveal': '' } : {})}>
        {items.map(({ q, a }) => (
          <details key={q} className="ui-faq__item">
            <summary>{q}</summary>
            <div className="ui-faq__answer">{typeof a === 'string' ? <p>{a}</p> : a}</div>
          </details>
        ))}
      </div>
      {jsonLd && structured.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqPage(structured.map((it) => ({ question: it.q, answer: it.a })))) }} />
      ) : null}
    </Section>
  )
}
