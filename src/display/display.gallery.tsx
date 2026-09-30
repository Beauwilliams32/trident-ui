/**
 * Gallery stories for the display group (spec §10.6). Not exported from the package entry; the
 * integrator's gallery imports `examples` from each src/<group>/*.gallery.tsx.
 */
import { Star } from 'lucide-react'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { Card } from './Card'
import { Chip } from './Chip'
import { StatCard } from './StatCard'
import { StatusPill, STATUS_MAP, type Status } from './StatusPill'
import type { GalleryExample } from './gallery-types'
import { TONES } from './tone'

export type { GalleryExample }

const noop = () => {}

export const examples: GalleryExample[] = [
  {
    component: 'Badge',
    name: 'Tones and sizes',
    render: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TONES.map((t) => (
          <Badge key={t} tone={t}>
            {t}
          </Badge>
        ))}
        <Badge tone="violet" size="sm" icon={<Star size={12} />}>
          Featured
        </Badge>
        <Badge tone="gold">3 new</Badge>
      </div>
    ),
  },
  {
    component: 'StatusPill',
    name: 'Every status',
    render: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(Object.keys(STATUS_MAP) as Status[]).map((s) => (
          <StatusPill key={s} status={s} />
        ))}
        <StatusPill status="published" label="Posted to Instagram" />
      </div>
    ),
  },
  {
    component: 'Chip',
    name: 'Static, toggle and removable',
    render: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Chip>Austin</Chip>
        <Chip tone="accent" onClick={noop} selected>
          Football
        </Chip>
        <Chip onClick={noop}>Basketball</Chip>
        <Chip tone="info" onRemove={noop}>
          Texas A&amp;M
        </Chip>
        <Chip onClick={noop} onRemove={noop} disabled>
          Disabled
        </Chip>
      </div>
    ),
  },
  {
    component: 'Avatar',
    name: 'Initials, sizes and shapes',
    render: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <Avatar name="Beau Williams" size="xs" />
        <Avatar name="Old Aggie Open" size="sm" shape="circle" />
        <Avatar name="Trident Studio" size="md" />
        <Avatar name="Kula Karate" size="lg" shape="circle" />
        <Avatar name="Decorative" size="sm" decorative />
      </div>
    ),
  },
  {
    component: 'Card',
    name: 'Solid, glass, interactive, accent, tilt',
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <Card>Solid card</Card>
        <Card variant="glass">Glass card</Card>
        <Card interactive>Interactive card</Card>
        <Card accent>Accent card</Card>
        <Card interactive tilt>
          Tilt card (motion gate)
        </Card>
        <Card as="article" padding="sm">
          Article, small padding
        </Card>
      </div>
    ),
  },
  {
    component: 'StatCard',
    name: 'Values, trends and empty',
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Posts published" value={1284} trend={{ dir: 'up', value: '+12%', note: 'vs last week' }} />
        <StatCard label="Churn" value="2.1%" trend={{ dir: 'down', value: '-0.4 pts', tone: 'ok' }} />
        <StatCard label="MRR" value={4200} formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} sub="Sample data" />
        <StatCard label="Failed payments" value={null} sub="No data yet" />
      </div>
    ),
  },
]
