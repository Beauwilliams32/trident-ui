/** Typed access to the build-time gallery data (gallery/data/plugin.ts). */
import raw from 'virtual:gallery-data'
import type { GalleryMeta } from './data/meta'
import type { ComponentApi } from './data/props'
import type { TokenDocs } from './data/tokens'

export interface GalleryData {
  /** Example render sources per gallery file (path relative to the repo root), in array order. */
  sources: Record<string, string[]>
  apis: ComponentApi[]
  tokens: TokenDocs
  meta: GalleryMeta
}

const data = raw as GalleryData
export default data
