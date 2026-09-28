import { THEME_SCHEMES } from '../src/server/themes'
import type { Group } from './registry'

export type MotionState = 'reduced' | 'paused' | 'on'

export interface GalleryProps {
  groups: Group[]
  theme: string
  motion: MotionState
  /** Render a single group only (?group=), for focused debugging. */
  only?: string | null
}

export function Gallery({ groups, theme, motion, only }: GalleryProps) {
  const shown = only ? groups.filter((g) => g.name === only) : groups
  return (
    <div className="g-page">
      <header className="g-head">
        <div>
          <h1>Trident UI gallery</h1>
          <nav aria-label="Themes">
            <ul className="g-themes">
              {Object.keys(THEME_SCHEMES).map((t) => (
                <li key={t}>
                  <a href={`?theme=${t}&motion=${motion}`} aria-current={t === theme ? 'page' : undefined}>
                    {t}
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
      <main>
        {shown.map((g) => (
          <section key={g.name} id={`group-${g.name}`} className="g-group" aria-labelledby={`h-${g.name}`} data-group={g.name}>
            <h2 id={`h-${g.name}`}>{g.name}</h2>
            <div className="g-grid">
              {g.examples.map((ex) => (
                <article key={ex.key} className="g-example" id={`ex-${g.name}-${ex.key}`} aria-labelledby={`h-${g.name}-${ex.key}`}>
                  <h3 id={`h-${g.name}-${ex.key}`}>{ex.title}</h3>
                  {ex.description ? <p>{ex.description}</p> : null}
                  <div className="g-body">{ex.render()}</div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
