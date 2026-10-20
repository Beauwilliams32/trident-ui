/**
 * Vite plugin: exposes the gallery's build-time data as `virtual:gallery-data` (example sources,
 * props tables from dist/*.d.ts, token docs, version and changelog) and inlines the favicon (the Trident UI tile), so the
 * gallery makes no request that can 404 (G17). Everything is computed in Node at build time.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'
import { componentApis } from './props.ts'
import { exampleSources } from './sources.ts'
import { tokenDocs } from './tokens.ts'
import { galleryMeta } from './meta.ts'

const ID = 'virtual:gallery-data'
const RESOLVED = `\0${ID}`

/** Every gallery module: src/<group>/*.gallery.tsx and the docs groups in gallery/docs/. */
export function galleryFiles(root: string): string[] {
  const out: string[] = []
  for (const g of readdirSync(join(root, 'src'), { withFileTypes: true }))
    if (g.isDirectory()) for (const f of readdirSync(join(root, 'src', g.name))) if (f.endsWith('.gallery.tsx')) out.push(join(root, 'src', g.name, f))
  for (const f of readdirSync(join(root, 'gallery', 'docs'))) if (f.endsWith('.gallery.tsx')) out.push(join(root, 'gallery', 'docs', f))
  return out.sort()
}

export function galleryData(root: string) {
  const sources: Record<string, string[]> = {}
  for (const file of galleryFiles(root)) sources[relative(root, file).replace(/\\/g, '/')] = exampleSources(file)
  return { sources, apis: componentApis(root), tokens: tokenDocs(), meta: galleryMeta(root) }
}

export function galleryDataPlugin(root: string): Plugin {
  return {
    name: 'trident-gallery-data',
    resolveId(id) {
      return id === ID ? RESOLVED : null
    },
    load(id) {
      if (id !== RESOLVED) return null
      for (const file of galleryFiles(root)) this.addWatchFile(file)
      return `export default ${JSON.stringify(galleryData(root))}`
    },
    transformIndexHtml(html) {
      // The supplied tile (brand/tile.svg), inlined as a data URI like the old mark.
      const svg = readFileSync(join(root, 'brand', 'tile.svg'), 'utf8')
      return html.replace('</head>', `  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(svg)}" />\n  </head>`)
    },
  }
}
