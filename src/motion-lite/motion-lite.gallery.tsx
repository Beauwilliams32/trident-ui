/**
 * Gallery stories for @trident/ui/motion-lite: the static markup contract that initMotion()
 * enhances on SSG pages (no React at runtime). The gallery page calls initMotion() once.
 */
import type { ReactElement } from 'react'

export interface GalleryExample {
  name: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactElement
}

export const group = 'motion-lite'

export const examples: GalleryExample[] = [
  {
    name: 'Pause motion button (static markup)',
    description: 'initMotion() binds any [data-motion-toggle] button; aria-pressed carries the state.',
    render: () => (
      <button type="button" className="ui-motion-toggle" data-motion-toggle="" aria-pressed="false">
        Pause motion
      </button>
    ),
  },
  {
    name: '[data-reveal] with --i stagger',
    description: 'Visible without JS; hidden only under html.ui-motion, with a 2.5s CSS failsafe.',
    render: () => (
      <div>
        {[0, 1, 2].map((i) => (
          <p key={i} data-reveal="" style={{ ['--i' as string]: i }}>
            Item {i + 1}
          </p>
        ))}
      </div>
    ),
  },
  {
    name: '[data-count-up]',
    description: 'The server renders the final value; initMotion() counts it up once when seen.',
    render: () => (
      <p>
        <strong data-count-up="">12,400</strong> posts published
      </p>
    ),
  },
  {
    name: '[data-tilt]',
    description: 'Fine pointer only, at most 7deg.',
    render: () => (
      <div data-tilt="" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--ui-line)' }}>
        Tilt card
      </div>
    ),
  },
]

export default { group, examples }
