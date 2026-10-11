/// <reference types="vite/client" />
/**
 * Collects every example from src/<group>/*.gallery.tsx and the documentation groups in
 * gallery/docs/*.gallery.tsx. Groups were built in parallel, so their example shapes differ
 * slightly ({id,title}, {name}, {component,name}); normalize() maps them to one. Each example gets
 * the source of its `render` function (extracted at build time) for the Code disclosure.
 */
import type { ReactNode } from 'react'
import data from './galleryData'

export interface RawExample {
  id?: string
  title?: string
  name?: string
  component?: string
  description?: string
  /** Span the whole row (documentation tables). */
  wide?: boolean
  /** Hide the Code disclosure (documentation groups whose render is not a usage example). */
  showCode?: boolean
  render: () => ReactNode
}

export interface Example {
  key: string
  title: string
  description?: string
  wide?: boolean
  code?: string
  render: () => ReactNode
}

export interface Group {
  name: string
  title: string
  summary: string
  /** Import path for the group's components, when it has one. */
  entry?: string
  /** Documentation group (gallery/docs) rather than a component group (src/). */
  docs: boolean
  examples: Example[]
}

/** Readable titles (G9), one-line summaries and import paths, in page order. */
export const GROUP_INFO: Record<string, { title: string; summary: string; entry?: string }> = {
  'getting-started': { title: 'Getting started', summary: 'Install the pinned tag, import the CSS in order, and keep legacy resets below the component layer.' },
  tokens: { title: 'Design tokens', summary: 'Every semantic role in this theme with its measured contrast, plus the spacing, radius, elevation and motion scales. Read from tokens.json at build time.' },
  brand: { title: 'Brand', summary: 'The Depth Line mark in each product’s accent pair and the contour backdrop. Shown for owner creative review; not released yet.' },
  a11y: { title: 'Accessibility', summary: 'Skip link, screen-reader-only text, polite announcements and the focus ring every control shares.', entry: '@trident/ui' },
  layout: { title: 'Layout', summary: 'Container widths, stacks, clusters, grids and page bands. Every variant is a class, so a strict CSP works.', entry: '@trident/ui' },
  type: { title: 'Typography', summary: 'Headings with required levels, text tones, links, code and long-form prose on the fluid type scale.', entry: '@trident/ui' },
  actions: { title: 'Actions', summary: 'Buttons, link buttons and icon buttons. One primary action per view; destructive actions are never the primary fill.', entry: '@trident/ui' },
  forms: { title: 'Forms', summary: 'Native-POST-first forms with CSRF, inline errors above the field and a GOV.UK-style error summary.', entry: '@trident/ui' },
  display: { title: 'Display', summary: 'Badges, status pills, chips, avatars, cards and stat cards. Status is always text plus colour.', entry: '@trident/ui' },
  feedback: { title: 'Feedback', summary: 'Inline alerts, server flash banners and toasts with live roles; errors stay until dismissed.', entry: '@trident/ui' },
  server: { title: 'Server rendering', summary: 'SeoHead, JSON-LD builders, renderPage and Island markup, shown as the HTML they emit.', entry: '@trident/ui/server' },
  islands: { title: 'Islands', summary: 'Server-rendered components that hydrate on load, on first interaction or when visible.', entry: '@trident/ui/islands' },
  'motion-lite': { title: 'Motion for static pages', summary: 'The 3 kB, library-free motion layer: reveals, count-ups, tilt and the Pause-motion control.', entry: '@trident/ui/motion-lite' },
  motion: { title: 'Motion for apps', summary: 'React wrappers over motion/react 13. Every example shows its final state under reduced motion and Pause.', entry: '@trident/ui/motion' },
  app: { title: 'App overlays and data', summary: 'Radix overlays, menus, tabs, the command palette, and the data table, empty state and skeleton.', entry: '@trident/ui/app' },
  marketing: { title: 'Marketing compositions', summary: 'Hero, features, pricing, FAQ, call-to-action, header and footer. Copy and prices always arrive as props.', entry: '@trident/ui/marketing' },
  three: { title: '3D', summary: 'Lazy3D slots, posters and the status orbit. 3D only ever appears as its poster in these screenshots.', entry: '@trident/ui/three' },
}

/** Page order; the component groups follow dist/styles.css (scripts/build-styles.mjs). */
export const GROUP_ORDER = Object.keys(GROUP_INFO)

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function normalize(raw: RawExample, code?: string): Example {
  const title = raw.title ?? (raw.component && raw.name ? `${raw.component}: ${raw.name}` : (raw.name ?? raw.component ?? 'Example'))
  const key = slug(raw.id ?? (raw.component ? `${raw.component}-${raw.name ?? ''}` : title))
  return {
    key,
    title,
    ...(raw.description ? { description: raw.description } : {}),
    ...(raw.wide ? { wide: true } : {}),
    ...(code && raw.showCode !== false ? { code } : {}),
    render: raw.render,
  }
}

type GalleryModule = { examples?: RawExample[]; default?: RawExample[] | { examples?: RawExample[] } }

const modules = import.meta.glob<GalleryModule>(['../src/*/*.gallery.tsx', './docs/*.gallery.tsx'], { eager: true })

function examplesOf(mod: GalleryModule): RawExample[] {
  if (Array.isArray(mod.examples)) return mod.examples
  if (Array.isArray(mod.default)) return mod.default
  return mod.default?.examples ?? []
}

/** "../src/forms/forms.gallery.tsx" -> "src/forms/forms.gallery.tsx"; "./docs/x.gallery.tsx" -> "gallery/docs/x.gallery.tsx". */
export const sourceKey = (path: string) => (path.startsWith('./') ? `gallery/${path.slice(2)}` : path.replace(/^\.\.\//, ''))
const groupName = (path: string) => (path.startsWith('./docs/') ? path.slice('./docs/'.length).replace(/\.gallery\.tsx$/, '') : (path.split('/').at(-2) ?? path))

export const groups: Group[] = Object.entries(modules)
  .map(([path, mod]) => {
    const name = groupName(path)
    const code = data.sources[sourceKey(path)] ?? []
    const info = GROUP_INFO[name] ?? { title: name, summary: '' }
    return { name, ...info, docs: path.startsWith('./docs/'), examples: examplesOf(mod).map((raw, i) => normalize(raw, code[i])) }
  })
  .filter((g) => g.examples.length > 0)
  .sort((a, b) => GROUP_ORDER.indexOf(a.name) - GROUP_ORDER.indexOf(b.name))
