/**
 * Gallery stories for @trident/ui/motion (consumed by the integrator's gallery page).
 * Every example must show its final state under reduced motion and Pause.
 */
import type { ReactElement } from 'react'
import { AmbientGlow, CountUp, MotionRoot, MotionToggle, Reveal, Tilt, ViewTransitionLink } from './index'

export interface GalleryExample {
  name: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactElement
}

export const group = 'motion'

export const examples: GalleryExample[] = [
  {
    name: 'MotionToggle',
    description: 'Persistent Pause motion control (WCAG 2.2.2). Sets html[data-motion="paused"].',
    render: () => <MotionToggle />,
  },
  {
    name: 'Reveal (staggered)',
    description: 'Rises into view once; 70ms × index stagger, capped at 6.',
    render: () => (
      <MotionRoot>
        <ul>
          {['Plan', 'Film', 'Publish'].map((step, i) => (
            <Reveal as="li" key={step} index={i}>
              {step}
            </Reveal>
          ))}
        </ul>
      </MotionRoot>
    ),
  },
  {
    name: 'CountUp',
    description: 'Counts to a value supplied by props. Dates and phone numbers stay static.',
    render: () => (
      <p>
        <CountUp value="$1,500/mo" /> · <CountUp value="98.6%" /> · <CountUp value="2022-2023" />
      </p>
    ),
  },
  {
    name: 'Tilt',
    description: 'Fine pointer only, at most 7deg. Flat on touch, reduced motion and Pause.',
    render: () => (
      <Tilt style={{ padding: 24, borderRadius: 16, border: '1px solid var(--ui-line)' }}>
        <strong>Hover me</strong>
      </Tilt>
    ),
  },
  {
    name: 'ViewTransitionLink',
    description: 'A real link that animates client-side navigation when allowed.',
    render: () => (
      <ViewTransitionLink href="#overview" onNavigate={() => {}}>
        Overview
      </ViewTransitionLink>
    ),
  },
  {
    name: 'AmbientGlow',
    description: 'CSS-only decorative glow; the drift loop stops under Pause and reduced motion.',
    render: () => (
      <div style={{ position: 'relative', overflow: 'hidden', padding: 48 }}>
        <AmbientGlow />
        <p style={{ position: 'relative' }}>Content above the glow</p>
      </div>
    ),
  },
]

export default { group, examples }
