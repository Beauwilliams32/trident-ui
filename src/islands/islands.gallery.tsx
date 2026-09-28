/**
 * Gallery examples for the islands group. The gallery page renders these on the server with
 * <Island>, then its client entry calls `hydrateIslands(registry)` with the exported registry.
 */
import { type ReactNode, useState } from 'react'
import { Island } from '../server/Island'
import type { IslandRegistry } from './index'

export interface GalleryExample {
  id: string
  title: string
  description?: string
  render: () => ReactNode
}

/** Demo island: a menu disclosure (button + aria-expanded). */
export function DemoDisclosure({ summary, items }: { summary: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls="gallery-disclosure" onClick={() => setOpen(!open)}>
        {summary}
      </button>
      <ul id="gallery-disclosure" hidden={!open}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** Demo island: a counter that starts from a server-supplied value. */
export function DemoCounter({ label, start }: { label: string; start: number }) {
  const [n, setN] = useState(start)
  return (
    <button type="button" onClick={() => setN(n + 1)}>
      {label}: {n}
    </button>
  )
}

/** Pass to hydrateIslands() in the gallery's client entry. */
export const registry: IslandRegistry = { DemoDisclosure, DemoCounter }

export const examples: GalleryExample[] = [
  {
    id: 'island-load',
    title: 'Island, hydrate="load"',
    render: () => <Island name="DemoCounter" component={DemoCounter} props={{ label: 'Saved', start: 3 }} hydrate="load" />,
  },
  {
    id: 'island-interaction',
    title: 'Island, hydrate="interaction"',
    description: 'Hydrates on first pointer, touch or focus.',
    render: () => (
      <Island name="DemoDisclosure" component={DemoDisclosure} props={{ summary: 'Menu', items: ['Deals', 'Athletes'] }} hydrate="interaction" />
    ),
  },
  {
    id: 'island-visible',
    title: 'Island, hydrate="visible"',
    render: () => <Island name="DemoCounter" component={DemoCounter} props={{ label: 'Seen', start: 0 }} hydrate="visible" />,
  },
]

export default examples
