import type { ReactNode } from 'react'
import { Lazy3D, type Lazy3DProps } from './Lazy3D'
import { stateText, statusCards, type StatusCardState, type StatusOrbitItem } from './statusCards'
import type { SceneLoader, StatusOrbitSceneProps } from './types'

export interface StatusOrbitListProps {
  items?: readonly StatusOrbitItem[] | null
  /** Accessible name of the list. */
  label?: string
  /** Show the list on screen instead of visually hiding it. */
  visible?: boolean
}

/**
 * The DOM equivalent of the orbit (spec §6.5, §9): every card's label and state as text, so 3D
 * never carries information the DOM does not. Visually hidden by default.
 */
export function StatusOrbitList({ items, label = 'Publishing status by platform', visible = false }: StatusOrbitListProps) {
  const cards = statusCards(items)
  if (!visible) {
    return (
      <ul className="ui-status-orbit__list ui-visually-hidden" aria-label={label}>
        {cards.map((c) => (
          <li key={c.key} data-state={c.state}>
            {`${c.label}: ${stateText(c.state)}`}
          </li>
        ))}
      </ul>
    )
  }
  // On screen: the same text per row (label, then the state as a StatusPill), so each row's text
  // content is still exactly "<label>: <state>" and the 3D cards and the DOM cannot disagree.
  return (
    <ul className="ui-status-orbit__list" data-visible="" aria-label={label}>
      {cards.map((c) => (
        <li key={c.key} data-state={c.state}>
          <span className="ui-status-orbit__label">{c.label}</span>
          <span className="ui-visually-hidden">: </span>
          <span className="ui-status ui-tone" data-tone={STATE_TONE[c.state]}>
            <span className="ui-status__dot" aria-hidden="true" />
            {stateText(c.state)}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Tone of each state's pill. Only a live platform is green; unknown stays neutral, never "ok". */
const STATE_TONE: Record<StatusCardState, string> = { live: 'ok', pending: 'warn', workflow: 'info', unknown: 'neutral' }

const loadStatusOrbitScene: SceneLoader<StatusOrbitSceneProps> = () =>
  import('./scene/index').then((m) => ({ default: m.StatusOrbitScene }))

export interface StatusOrbitProps extends Omit<Lazy3DProps<StatusOrbitSceneProps>, 'scene' | 'sceneProps' | 'children'> {
  /** Status-derived items. Only `live: true` platform items are lit; omit to show the never-lit fallback. */
  items?: readonly StatusOrbitItem[] | null
  center?: [number, number, number]
  listLabel?: string
  children?: ReactNode
}

/**
 * The WMH hero orbit (a port of hero-3d.js): fresnel core, two tilted rings and status cards,
 * mounted through `<Lazy3D>`, with the visually hidden DOM list always rendered.
 */
export function StatusOrbit({ items, center, listLabel, children, ...lazy }: StatusOrbitProps) {
  return (
    <Lazy3D<StatusOrbitSceneProps> {...lazy} scene={loadStatusOrbitScene} sceneProps={{ items: items ?? null, center }}>
      <StatusOrbitList items={items} label={listLabel} />
      {children}
    </Lazy3D>
  )
}
