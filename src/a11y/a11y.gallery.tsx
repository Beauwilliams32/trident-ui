/**
 * Gallery examples for the a11y group. The gallery imports `examples` from every
 * src/<group>/*.gallery.tsx and renders each one per theme × scheme. Not exported from the package.
 */
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button, buttonClassName } from '../actions/Button'
import { TextLink } from '../type/TextLink'
import { FocusRing } from './FocusRing'
import { LiveAnnouncer, useAnnouncer } from './LiveAnnouncer'
import { SkipLink } from './SkipLink'
import { VisuallyHidden } from './VisuallyHidden'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactNode
}

export const group = 'a11y'

function AnnounceDemo() {
  const announce = useAnnouncer()
  return (
    <Button variant="secondary" onClick={() => announce('Saved. 3 posts scheduled.')}>
      Announce “Saved”
    </Button>
  )
}

export const examples: GalleryExample[] = [
  {
    id: 'skip-link',
    title: 'SkipLink (Tab to reveal)',
    description: 'The first focusable element on every page. Hidden until a keyboard user tabs to it, then it jumps past the navigation.',
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
    description: 'Text for screen readers only, such as the name of an icon-only control. Prefer a visible label when there is room.',
    render: () => (
      <button type="button" className={buttonClassName({ variant: 'secondary', iconOnly: true })}>
        <X aria-hidden="true" size={18} />
        <VisuallyHidden>Close panel</VisuallyHidden>
      </button>
    ),
  },
  {
    id: 'live-announcer',
    title: 'LiveAnnouncer + useAnnouncer',
    description: 'Announces the result of an action that has no visible change at the focus point, politely, without moving focus.',
    render: () => (
      <LiveAnnouncer>
        <AnnounceDemo />
      </LiveAnnouncer>
    ),
  },
  {
    id: 'focus-ring',
    title: 'FocusRing (element and within)',
    description: 'The shared 2px focus ring for custom focusable elements, or around a whole card while a link inside it has focus.',
    render: () => (
      <div className="g-stack">
        <FocusRing>
          <div tabIndex={0} role="button" aria-pressed="false" className="g-demo-box">
            Custom focusable
          </div>
        </FocusRing>
        <FocusRing within>
          <article className="g-demo-card">
            <TextLink href="#card">Card link: the whole card shows the ring</TextLink>
          </article>
        </FocusRing>
      </div>
    ),
  },
]
