import { useId, type ReactNode } from 'react'
import { cx } from '../actions/internal'
import { Container } from '../layout/Container'
import { Heading } from '../type/Heading'
import { Prose } from '../type/Prose'

export interface LegalSection {
  /** Anchor id for the table of contents ("data-we-collect"). */
  id: string
  title: string
  content: ReactNode
}

export interface LegalDocProps {
  /** The document's title ("Privacy policy"). Rendered as the page's h1 unless `level` says otherwise. */
  title: string
  /** When it last changed, already formatted by the server ("1 October 2026"). */
  updated?: ReactNode
  /** A version or effective-date line, if the document has one. */
  version?: ReactNode
  /** Text before the first section. */
  intro?: ReactNode
  sections: ReadonlyArray<LegalSection>
  /** Contents label. Default "Contents". */
  tocLabel?: string
  /** The title's heading level: 1 on its own page, lower when embedded (docs, the gallery). Default 1. */
  level?: 1 | 2 | 3 | 4
  className?: string
}

/**
 * A privacy policy, terms or similar document (spec §7 P1 LegalDoc): a title, the update date, a
 * table of contents and the sections in readable prose. It needs no JavaScript and emits no script
 * (legal pages ship zero `<script>`, spec §8), and it sets `data-surface="legal"` so no 3D or
 * ambient loop can mount inside it (§6.8). The wording is the owner's: this component authors none.
 */
export function LegalDoc({ title, updated, version, intro, sections, tocLabel = 'Contents', level = 1, className }: LegalDocProps) {
  const id = useId()
  return (
    <Container size="prose" className={cx('ui-legal', className)}>
      <article data-surface="legal" aria-labelledby={`${id}-title`}>
        <header className="ui-legal__head">
          <Heading level={level} size="4xl" id={`${id}-title`}>
            {title}
          </Heading>
          {updated || version ? (
            <p className="ui-legal__meta">
              {updated ? <span>Last updated {updated}</span> : null}
              {version ? <span>{version}</span> : null}
            </p>
          ) : null}
        </header>
        {intro ? <Prose>{intro}</Prose> : null}
        {sections.length > 1 ? (
          <nav className="ui-legal__toc" aria-label={tocLabel}>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a className="ui-link" href={`#${s.id}`}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="ui-legal__section" aria-labelledby={`${s.id}-h`}>
            <Heading level={(level + 1) as 2 | 3 | 4 | 5} size="2xl" id={`${s.id}-h`}>
              {s.title}
            </Heading>
            <Prose>{s.content}</Prose>
          </section>
        ))}
      </article>
    </Container>
  )
}
