import { useEffect, useState } from 'react'
import data from './galleryData'
import { THEME_SCHEMES } from '../src/server/themes'
import { SkipLink } from '../src/a11y/SkipLink'
import { CodeSample } from './CodeSample'
import { PropsTable } from './PropsTable'
import type { Group } from './registry'
import { galleryHref, MOTION_STATES, type GalleryLocation, type MotionState } from './url'

export type { MotionState }

export interface GalleryProps {
  groups: Group[]
  theme: string
  motion: MotionState
  /** Render a single group only (?group=), for focused review. */
  only?: string | null
}

const MOTION_LABEL: Record<MotionState, string> = { on: 'Motion on', reduced: 'Reduced', paused: 'Paused' }

/** The current #hash, kept in state so the theme and motion links carry it (G9). */
function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

function SectionLinks({ groups, at, only }: { groups: Group[]; at: GalleryLocation; only: string | null | undefined }) {
  return (
    <ul className="g-toc__list">
      {only ? (
        <li>
          <a href={galleryHref(at, { group: null, hash: '' })}>All sections</a>
        </li>
      ) : null}
      {groups.map((g) => (
        <li key={g.name}>
          <a href={only ? galleryHref(at, { group: g.name, hash: '' }) : `#group-${g.name}`} aria-current={only === g.name ? 'page' : undefined}>
            {g.title}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Gallery({ groups, theme, motion, only }: GalleryProps) {
  const hash = useHash()
  const at: GalleryLocation = { theme, motion, group: only ?? null, hash }
  const shown = only ? groups.filter((g) => g.name === only) : groups
  const { meta, apis } = data
  return (
    <div className="g-page">
      <SkipLink targetId="g-main" />
      <header className="g-head">
        <div className="g-brand">
          <h1>Trident UI</h1>
          <a className="g-version" href={meta.changelogUrl}>
            v{meta.version}
            <span className="ui-visually-hidden"> changelog</span>
          </a>
          <a className="g-changelog" href="#changelog">
            What’s new
          </a>
        </div>
        <div className="g-switches">
          <nav aria-label="Theme" className="g-switch">
            <span className="g-switch__label" aria-hidden="true">
              Theme
            </span>
            <ul>
              {Object.keys(THEME_SCHEMES).map((t) => (
                <li key={t}>
                  <a href={galleryHref(at, { theme: t })} aria-current={t === theme ? 'page' : undefined}>
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Motion" className="g-switch">
            <span className="g-switch__label" aria-hidden="true">
              Motion
            </span>
            <ul>
              {MOTION_STATES.map((m) => (
                <li key={m}>
                  <a href={galleryHref(at, { motion: m })} aria-current={m === motion ? 'page' : undefined}>
                    {MOTION_LABEL[m]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="g-meta">
          theme={theme} · scheme={THEME_SCHEMES[theme as keyof typeof THEME_SCHEMES]} · motion={motion}
        </p>
      </header>

      <details className="g-jump">
        <summary>Jump to a section</summary>
        <nav aria-label="Sections (menu)">
          <SectionLinks groups={groups} at={at} only={only} />
        </nav>
      </details>

      <div className="g-layout">
        <nav className="g-toc" aria-label="Sections">
          <SectionLinks groups={groups} at={at} only={only} />
        </nav>
        <main id="g-main" tabIndex={-1}>
          {shown.map((g) => {
            const groupApis = g.docs ? [] : apis.filter((a) => a.group === g.name)
            return (
              <section key={g.name} id={`group-${g.name}`} className="g-group" aria-labelledby={`h-${g.name}`} data-group={g.name}>
                <div className="g-group__head">
                  <h2 id={`h-${g.name}`}>{g.title}</h2>
                  {g.summary ? <p className="g-group__summary">{g.summary}</p> : null}
                  {g.entry ? (
                    <p className="g-group__entry">
                      Import from <code>{g.entry}</code>
                    </p>
                  ) : null}
                </div>
                <div className="g-grid">
                  {g.examples.map((ex) => (
                    <article key={ex.key} className="g-example" data-wide={ex.wide ? '' : undefined} id={`ex-${g.name}-${ex.key}`} aria-labelledby={`h-${g.name}-${ex.key}`}>
                      <h3 id={`h-${g.name}-${ex.key}`}>{ex.title}</h3>
                      {ex.description ? <p className="g-desc">{ex.description}</p> : null}
                      <div className="g-body">{ex.render()}</div>
                      {ex.code ? (
                        <details className="g-code">
                          <summary>Code</summary>
                          <CodeSample code={ex.code} label={`${ex.title}: code`} language="tsx" />
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
                {groupApis.length ? (
                  <details className="g-api">
                    <summary>
                      Props reference <span className="g-api__count">({groupApis.map((a) => a.name).join(', ')})</span>
                    </summary>
                    <div className="g-api__body">
                      {groupApis.map((a) => (
                        <PropsTable key={a.name} api={a} />
                      ))}
                    </div>
                  </details>
                ) : null}
              </section>
            )
          })}
        </main>
      </div>
    </div>
  )
}
