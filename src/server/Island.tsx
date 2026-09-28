/**
 * <Island>: server-renders an interactive component and writes its props as a JSON data block for
 * hydrateIslands() (spec §7, §8). No inline JS is emitted: the props travel in
 * `<script type="application/json">`, which browsers never execute, so `script-src 'self'` holds.
 *
 * The rest of the page stays static HTML; only islands hydrate, and only when their strategy fires.
 */
import { type ComponentType, createElement, type ReactElement } from 'react'
import { HYDRATE_ATTR, HYDRATE_STRATEGIES, type HydrateStrategy, ISLAND_ATTR, ISLAND_NAME, PROPS_ATTR } from '../islands/protocol'
import { assertJsonSerializable, safeJson } from './json'

export interface IslandProps<P extends object> {
  /** Registry key the client passes to hydrateIslands(), e.g. `MobileNav`. */
  name: string
  /** The component. The client registry must map `name` to this same component. */
  component: ComponentType<P>
  /** Plain JSON props. Anything that would not survive JSON (Dates, functions, Maps…) throws. */
  props: P
  /** When to hydrate. Default `idle` (spec §8: React loads on idle or interaction). */
  hydrate?: HydrateStrategy
  /** Wrapper element. Use `span` for an island inside phrasing content. */
  as?: 'div' | 'span' | 'section' | 'aside' | 'nav' | 'li'
  className?: string
}

export function Island<P extends object>(islandProps: IslandProps<P>): ReactElement {
  const { name, component, props, hydrate = 'idle', as: Tag = 'div', className } = islandProps
  if (!ISLAND_NAME.test(name)) throw new TypeError(`Island: invalid name "${name}" (letters, digits, - and _; starts with a letter)`)
  if (!HYDRATE_STRATEGIES.includes(hydrate)) throw new TypeError(`Island "${name}": unknown hydrate strategy "${hydrate}"`)
  assertJsonSerializable(props, `Island "${name}" props`)

  // Serialise first, then render from the parsed copy: the server renders from exactly the value
  // the client will read, so JSON-only differences (e.g. -0 → 0) can never cause a mismatch.
  const json = safeJson(props)
  const clientProps = JSON.parse(json) as P

  return (
    <>
      {createElement(Tag, { [ISLAND_ATTR]: name, [HYDRATE_ATTR]: hydrate, className }, createElement(component, clientProps))}
      <script type="application/json" {...{ [PROPS_ATTR]: '' }} dangerouslySetInnerHTML={{ __html: json }} />
    </>
  )
}
