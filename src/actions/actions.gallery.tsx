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
  render: () => ReactElement
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']
const row = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' } as const

export const group = 'actions'

export const examples: GalleryExample[] = [
  {
    id: 'button-variants',
    title: 'Button variants',
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
    id: 'button-states',
    title: 'Loading keeps the width; disabled',
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
