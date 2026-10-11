/**
 * Token documentation views (G8). Pure: they take the build-time TokenDocs as a prop, so the
 * gallery and test/gallery/tokens-doc.test.tsx render exactly the same thing.
 */
import type { CSSProperties } from 'react'
import type { RoleDoc, ThemeDoc, TokenDocs } from '../data/tokens'

const fmt = (n: number) => `${n.toFixed(2)}:1`

function Checks({ role }: { role: RoleDoc }) {
  if (!role.pairs.length) return <span className="g-tok__none">Not text or a fill: no contrast floor</span>
  const asFg = role.pairs.filter((p) => p.fg === role.role)
  const asBg = role.pairs.filter((p) => p.bg === role.role && p.fg !== role.role)
  const line = (list: typeof role.pairs, side: 'fg' | 'bg') => {
    const worst = list.reduce((a, b) => (b.ratio - b.min < a.ratio - a.min ? b : a))
    const pass = list.every((p) => p.ratio >= p.min)
    const other = side === 'fg' ? worst.bg : worst.fg
    return (
      <span>
        {side === 'fg' ? `on ${list.map((p) => p.bg).join(', ')}` : `under ${list.length} text roles`}: lowest <strong>{fmt(worst.ratio)}</strong> ({side === 'fg' ? 'on' : 'with'} {other}), needs {worst.min}:1{' '}
        <span className="g-tok__verdict" data-pass={pass ? '' : undefined}>
          {pass ? 'Pass' : 'Fail'}
        </span>
      </span>
    )
  }
  return (
    <span className="g-tok__checks">
      {asFg.length ? line(asFg, 'fg') : null}
      {asBg.length ? line(asBg, 'bg') : null}
    </span>
  )
}

/** Every colour role of one theme: live swatch, resolved value, Increase Contrast value, checks. */
export function ColorRoles({ theme }: { theme: ThemeDoc }) {
  const colors = theme.roles.filter((r) => r.kind === 'color')
  return (
    <div className="g-api__scroll" role="region" aria-label={`Colour roles in ${theme.name}`} tabIndex={0}>
      <table className="g-api__table g-tok">
        <caption className="ui-visually-hidden">Colour roles in {theme.name} ({theme.scheme})</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Value</th>
            <th scope="col">Increase Contrast</th>
            <th scope="col">Contrast checks (tokens.json)</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((r) => (
            <tr key={r.role} data-role={r.role}>
              <th scope="row">
                <span className="g-tok__swatch" style={{ background: `var(--ui-${r.role})` } as CSSProperties} aria-hidden="true" />
                <code>--ui-{r.role}</code>
              </th>
              <td>
                <code className="g-api__type">{r.value}</code>
              </td>
              <td>{r.highContrast ? <code>{r.highContrast}</code> : <span aria-label="unchanged">–</span>}</td>
              <td>
                <Checks role={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Fonts, radii and blur roles of one theme (the non-colour semantic roles). */
export function ShapeRoles({ theme }: { theme: ThemeDoc }) {
  const fonts = theme.roles.filter((r) => r.kind === 'font')
  const radii = theme.roles.filter((r) => r.kind === 'radius')
  const sizes = theme.roles.filter((r) => r.kind === 'size')
  return (
    <div className="g-stack">
      <ul className="g-tok__list">
        {fonts.map((r) => (
          <li key={r.role} data-role={r.role}>
            <code>--ui-{r.role}</code>
            <span style={{ fontFamily: `var(--ui-${r.role})`, fontSize: 20, color: 'var(--ui-ink)' }}>Ship the whole fleet 0123</span>
          </li>
        ))}
      </ul>
      <ul className="g-tok__radii">
        {radii.map((r) => (
          <li key={r.role} data-role={r.role}>
            <span className="g-tok__radius" style={{ borderRadius: `var(--ui-${r.role})` }} aria-hidden="true" />
            <code>--ui-{r.role}</code>
            <span className="g-tok__value">{r.value}</span>
          </li>
        ))}
        {sizes.map((r) => (
          <li key={r.role} data-role={r.role}>
            <span className="g-tok__radius" aria-hidden="true" style={{ borderStyle: 'dashed' }} />
            <code>--ui-{r.role}</code>
            <span className="g-tok__value">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SpaceScale({ docs }: { docs: TokenDocs }) {
  const steps = Object.entries(docs.space).sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
  return (
    <ul className="g-tok__list">
      {steps.map(([k, v]) => (
        <li key={k}>
          <code>--ui-space-{k}</code>
          <span className="g-tok__bar" style={{ inlineSize: v }} aria-hidden="true" />
          <span className="g-tok__value">{v}</span>
        </li>
      ))}
    </ul>
  )
}

export function Elevation({ docs, scheme }: { docs: TokenDocs; scheme: 'dark' | 'light' }) {
  return (
    <ul className="g-tok__elev">
      {Object.keys(docs.elevation[scheme] ?? {}).map((k) => (
        <li key={k} style={{ boxShadow: `var(--ui-${k})` }}>
          <code>--ui-{k}</code>
        </li>
      ))}
    </ul>
  )
}

export function MotionScale({ docs }: { docs: TokenDocs }) {
  return (
    <div className="g-stack">
      <div className="g-tok__pair">
        <div className="g-api__scroll" role="region" aria-label="Durations" tabIndex={0}>
          <table className="g-api__table">
            <thead>
              <tr>
                <th scope="col">Duration</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(docs.durations).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">
                    <code>{k === 'base' ? '--ui-dur' : `--ui-dur-${k}`}</code>
                  </th>
                  <td>{v}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="g-api__scroll" role="region" aria-label="Easings" tabIndex={0}>
          <table className="g-api__table">
            <thead>
              <tr>
                <th scope="col">Easing</th>
                <th scope="col">Curve</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(docs.easings).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">
                    <code>{k === 'ease' ? '--ui-ease' : k.startsWith('spring') ? `--ui-${k}` : `--ui-ease-${k}`}</code>
                  </th>
                  <td>
                    <code>cubic-bezier({v.join(', ')})</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-desc" style={{ margin: 0 }}>
        Springs (JS, motion/react):{' '}
        {Object.entries(docs.springs)
          .map(([k, sp]) => `${k} (${Object.entries(sp).map(([a, b]) => `${a} ${b}`).join(', ')})`)
          .join(' · ')}
        . Under reduced motion or Pause every duration collapses to 0.01ms.
      </p>
    </div>
  )
}

export function ComponentTokens({ docs }: { docs: TokenDocs }) {
  return (
    <ul className="g-tok__chips">
      {Object.entries(docs.component).map(([k, v]) => (
        <li key={k}>
          <code>--ui-{k}</code> <span className="g-tok__value">{v.replace(/\{([^}]+)\}/g, 'var(--ui-$1)')}</span>
        </li>
      ))}
    </ul>
  )
}
