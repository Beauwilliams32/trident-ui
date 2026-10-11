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
    description: 'Short labels and counts. Every tone pairs text with colour, so meaning never rests on colour alone.',
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
    description: 'Publishing and workflow states with a dot and an uppercase label; a custom label keeps the status tone.',
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
    description: 'Filters and selections. A toggle chip is a pressed button; the remove button is separate, so each control has one job.',
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
    description: 'Photo or initials on the accent fill (on-accent contrast is tested). Decorative avatars are hidden from screen readers.',
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
    description: 'Solid by default; glass only over imagery; interactive cards lift and sweep behind the motion gate.',
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
    description: 'Real values only, rendered final on the server. With no data it says so and shows a dash, never a fake zero.',
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Posts published" value={1284} trend={{ dir: 'up', value: '+12%', note: 'vs last week' }} />
        <StatCard label="Churn" value="2.1%" trend={{ dir: 'down', value: '-0.4 pts', tone: 'ok' }} />
        <StatCard label="MRR" value={4200} formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} sub="Sample data" />
        <StatCard label="Failed payments" value={null} sub="No data yet" />
      </div>
    ),
  },
  {
    component: 'Chip',
    name: 'Right to left (dir="rtl")',
    description: 'In a right-to-left page the chips mirror: label padding, the remove button and the selected ring follow the text direction.',
    render: () => (
      <div dir="rtl" lang="ar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 8px' }}>
        <Chip>القاهرة</Chip>
        <Chip tone="accent" onClick={noop} selected>
          دبي
        </Chip>
        <Chip tone="info" onRemove={noop} removeLabel="إزالة الرياض">
          الرياض
        </Chip>
      </div>
    ),
  },
]
