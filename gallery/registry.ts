/// <reference types="vite/client" />
/**
 * Collects every example from src/<group>/*.gallery.tsx. Groups were built in parallel, so their
 * example shapes differ slightly ({id,title}, {name}, {component,name}); normalize() maps them to one.
 */
import type { ReactNode } from 'react'

export interface RawExample {
  id?: string
  title?: string
  name?: string
  component?: string
  description?: string
  render: () => ReactNode
}

export interface Example {
  key: string
  title: string
  description?: string
  render: () => ReactNode
}

export interface Group {
  name: string
  examples: Example[]
}

/** Same order as dist/styles.css (scripts/build-styles.mjs). */
export const GROUP_ORDER = ['a11y', 'layout', 'type', 'actions', 'forms', 'display', 'feedback', 'server', 'islands', 'motion-lite', 'motion', 'app', 'three']

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function normalize(raw: RawExample): Example {
  const title = raw.title ?? (raw.component && raw.name ? `${raw.component}: ${raw.name}` : (raw.name ?? raw.component ?? 'Example'))
  const key = slug(raw.id ?? (raw.component ? `${raw.component}-${raw.name ?? ''}` : title))
  return { key, title, ...(raw.description ? { description: raw.description } : {}), render: raw.render }
}

type GalleryModule = { examples?: RawExample[]; default?: RawExample[] | { examples?: RawExample[] } }

const modules = import.meta.glob<GalleryModule>('../src/*/*.gallery.tsx', { eager: true })

function examplesOf(mod: GalleryModule): RawExample[] {
  if (Array.isArray(mod.examples)) return mod.examples
  if (Array.isArray(mod.default)) return mod.default
  return mod.default?.examples ?? []
}

export const groups: Group[] = Object.entries(modules)
  .map(([path, mod]) => ({ name: path.split('/').at(-2) ?? path, examples: examplesOf(mod).map(normalize) }))
  .filter((g) => g.examples.length > 0)
  .sort((a, b) => GROUP_ORDER.indexOf(a.name) - GROUP_ORDER.indexOf(b.name))
