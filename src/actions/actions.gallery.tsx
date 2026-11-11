/**
 * Gallery examples for the actions group, consumed by the integrator's gallery page (spec §10.6).
 * Each example is static, deterministic markup: no timers, no fetches, no randomness.
 */
import type { ReactElement } from 'react'
import { ArrowRight, Download, Plus, Settings, Trash2, X } from 'lucide-react'
import { Button, IconButton, LinkButton, type ButtonSize, type ButtonVariant } from './Button'

export interface GalleryExample {
  id: string
  title: string
  /** One line: when to use it. Required: the gallery test fails without it. */
  description: string
  render: () => ReactElement
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']
// 16px between rows: on touch every button's hit region grows to 44px (G5) and must not overlap.
const row = { display: 'flex', flexWrap: 'wrap', gap: '16px 12px', alignItems: 'center' } as const

export const group = 'actions'

export const examples: GalleryExample[] = [
  {
    id: 'button-variants',
    title: 'Button variants',
    description: 'One primary per view for the likeliest action; secondary (glass) for the rest; ghost in toolbars; link inline.',
    render: () => (
      <div style={row}>
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>
            {v === 'secondary' ? 'Secondary (glass)' : v[0]!.toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </div>
    ),
  },
  {
    id: 'button-sizes',
    title: 'Button sizes (32 / 36 / 44)',
    description: 'sm for dense tables, md by default, lg for the main call to action. On touch every size answers taps across 44px.',
    render: () => (
      <div style={row}>
        {SIZES.map((s) => (
          <Button key={s} size={s} icon={Plus}>
            New item ({s})
          </Button>
        ))}
      </div>
    ),
  },
  {
    id: 'game-control',
    title: 'Game control target (48px)',
    description: 'Opt in to the visible 48px minimum for gameplay actions while retaining the product’s own labels, art and theme.',
    render: () => (
      <div style={row}>
        <Button gameControl>Pause</Button>
        <IconButton gameControl icon={Settings} aria-label="Game settings" />
        <LinkButton gameControl href="#resume" variant="secondary">Resume</LinkButton>
      </div>
    ),
  },
  {
    id: 'button-states',
    title: 'Loading keeps the width; disabled',
    description: 'Loading shows a spinner inside the button, keeps its width and can swap the accessible name (“Saving…”).',
    render: () => (
      <div style={row}>
        <Button>Save changes</Button>
        <Button loading loadingLabel="Saving…">
          Save changes
        </Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button variant="danger" icon={Trash2}>
          Delete
        </Button>
      </div>
    ),
  },
  {
    id: 'native-submit',
    title: 'Native submit (works without JavaScript)',
    description: 'type="submit" posts the surrounding form natively, so the action works before or without hydration.',
    render: () => (
      <form method="post" action="#" style={row}>
        <Button type="submit" iconEnd={ArrowRight}>
          Continue
        </Button>
      </form>
    ),
  },
  {
    id: 'link-button',
    title: 'LinkButton',
    description: 'A real link styled as a button: use it for navigation, and Button for actions.',
    render: () => (
      <div style={row}>
        <LinkButton href="#pricing">See pricing</LinkButton>
        <LinkButton href="#download" variant="secondary" icon={Download}>
          Download
        </LinkButton>
        <LinkButton href="#docs" variant="link">
          Read the docs
        </LinkButton>
      </div>
    ),
  },
  {
    id: 'icon-button',
    title: 'IconButton (aria-label required)',
    description: 'Square, icon-only. The aria-label is required by the type; pair it with a Tooltip in apps.',
    render: () => (
      <div style={row}>
        {SIZES.map((s) => (
          <IconButton key={s} size={s} icon={Settings} aria-label={`Settings (${s})`} />
        ))}
        <IconButton icon={X} variant="secondary" aria-label="Close" />
        <IconButton icon={Trash2} variant="danger" aria-label="Delete item" />
        <IconButton icon={Plus} variant="primary" aria-label="Add" loading />
      </div>
    ),
  },
]

export default { group, examples }
