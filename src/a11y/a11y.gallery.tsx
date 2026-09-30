/**
 * Gallery examples for the a11y group. The integrator's gallery imports `examples` from every
 * src/<group>/*.gallery.tsx and renders each one per theme × scheme. Not exported from the package.
 */
import type { ReactNode } from 'react'
import { FocusRing } from './FocusRing'
import { LiveAnnouncer, useAnnouncer } from './LiveAnnouncer'
import { SkipLink } from './SkipLink'
import { VisuallyHidden } from './VisuallyHidden'

export interface GalleryExample {
  id: string
  title: string
  render: () => ReactNode
}

export const group = 'a11y'

function AnnounceDemo() {
  const announce = useAnnouncer()
  return (
    <button type="button" onClick={() => announce('Saved. 3 posts scheduled.')}>
      Announce “Saved”
    </button>
  )
}

export const examples: GalleryExample[] = [
  {
    id: 'skip-link',
    title: 'SkipLink (Tab to reveal)',
    render: () => (
      <div>
        <SkipLink targetId="gallery-main" />
        <p>Press Tab: the skip link appears top-left.</p>
        <div id="gallery-main" tabIndex={-1}>
          Main content target
        </div>
      </div>
    ),
  },
  {
    id: 'visually-hidden',
    title: 'VisuallyHidden',
    render: () => (
      <button type="button">
        <span aria-hidden="true">✕</span>
        <VisuallyHidden>Close panel</VisuallyHidden>
      </button>
    ),
  },
  {
    id: 'live-announcer',
    title: 'LiveAnnouncer + useAnnouncer',
    render: () => (
      <LiveAnnouncer>
        <AnnounceDemo />
      </LiveAnnouncer>
    ),
  },
  {
    id: 'focus-ring',
    title: 'FocusRing (element and within)',
    render: () => (
      <div>
        <FocusRing>
          <div tabIndex={0} role="button" aria-pressed="false">
            Custom focusable
          </div>
        </FocusRing>
        <FocusRing within>
          <article>
            <a href="#card">Card link: the whole card shows the ring</a>
          </article>
        </FocusRing>
      </div>
    ),
  },
]
