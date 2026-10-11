/**
 * Gallery examples for the islands group. The gallery page renders these on the server with
 * <Island>, then its client entry calls `hydrateIslands(registry)` with the exported registry.
 */
import { type ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '../actions/Button'
import { Island } from '../server/Island'
import type { IslandRegistry } from './index'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactNode
}

/** Demo island: a menu disclosure (button + aria-expanded). */
export function DemoDisclosure({ summary, items }: { summary: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button variant="secondary" iconEnd={ChevronDown} aria-expanded={open} aria-controls="gallery-disclosure" onClick={() => setOpen(!open)}>
        {summary}
      </Button>
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
    <Button variant="secondary" onClick={() => setN(n + 1)}>
      {label}: {n}
    </Button>
  )
}

/** Pass to hydrateIslands() in the gallery's client entry. */
export const registry: IslandRegistry = { DemoDisclosure, DemoCounter }

export const examples: GalleryExample[] = [
  {
    id: 'island-load',
    title: 'Island, hydrate="load"',
    description: 'Hydrates as soon as the page loads, for controls needed straight away. The server-rendered state shows first.',
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
    description: 'Hydrates when scrolled into view, for below-the-fold widgets. Costs nothing until then.',
    render: () => <Island name="DemoCounter" component={DemoCounter} props={{ label: 'Seen', start: 0 }} hydrate="visible" />,
  },
]

export default examples
