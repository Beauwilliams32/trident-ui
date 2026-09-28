import type { ReactNode } from 'react'
import { Lazy3D, type Lazy3DProps } from './Lazy3D'
import { stateText, statusCards, type StatusOrbitItem } from './statusCards'
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
  return (
    <ul className={visible ? 'ui-status-orbit__list' : 'ui-status-orbit__list ui-visually-hidden'} aria-label={label}>
      {cards.map((c) => (
        <li key={c.key} data-state={c.state}>
          {`${c.label}: ${stateText(c.state)}`}
        </li>
      ))}
    </ul>
  )
}

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
