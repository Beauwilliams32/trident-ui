/**
 * Gallery URLs (G9). Switching theme or motion keeps the focused group and the scroll hash, so a
 * reviewer comparing one example across themes never loses their place.
 */
export const MOTION_STATES = ['on', 'reduced', 'paused'] as const
export type MotionState = (typeof MOTION_STATES)[number]

export interface GalleryLocation {
  theme: string
  motion: MotionState
  group: string | null
  hash: string
}

export function readLocation(search: string, hash: string, fallbackTheme = 'fleet'): GalleryLocation {
  const p = new URLSearchParams(search)
  const m = p.get('motion')
  return {
    theme: p.get('theme') ?? fallbackTheme,
    motion: m === 'reduced' || m === 'paused' ? m : 'on',
    group: p.get('group'),
    hash: hash.startsWith('#') ? hash : hash ? `#${hash}` : '',
  }
}

/** The href for `at` with some fields changed. Unknown query parameters are dropped on purpose. */
export function galleryHref(at: GalleryLocation, change: Partial<GalleryLocation>): string {
  const next = { ...at, ...change }
  const q = new URLSearchParams()
  q.set('theme', next.theme)
  q.set('motion', next.motion)
  if (next.group) q.set('group', next.group)
  return `?${q.toString()}${next.hash}`
}
