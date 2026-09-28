/**
 * Gallery stories for @trident/ui/three (spec §10.6). The integrator's gallery imports `examples`.
 * 3D is snapshotted only through its poster, so every example renders deterministically with the
 * canvas gated off (reduced motion, Pause, screenshots). All scenes are procedural; no remote assets.
 */
import type { ReactNode } from 'react'
import { Lazy3D } from './Lazy3D'
import { PosterFallback } from './PosterFallback'
import { StatusOrbit, StatusOrbitList } from './StatusOrbit'
import type { SceneLoader, SceneProps } from './types'

export interface GalleryExample {
  id: string
  title: string
  description: string
  render: () => ReactNode
}

export const group = 'three'

/** A procedural scene: the fresnel core alone, from the lazily loaded kit. */
function CoreScene({ kit, quality }: SceneProps) {
  return <kit.FresnelCore segments={quality === 'high' ? 40 : 24} />
}
const coreScene: SceneLoader = async () => ({ default: CoreScene })

/** The core with one decorative ring of small cores (no text, no information). */
function RingScene({ kit }: SceneProps) {
  return (
    <>
      <kit.FresnelCore radius={0.7} />
      <kit.OrbitRing radius={2} showPath>
        <kit.FresnelCore radius={0.12} halo={false} segments={16} />
        <kit.FresnelCore radius={0.12} halo={false} segments={16} />
        <kit.FresnelCore radius={0.12} halo={false} segments={16} />
      </kit.OrbitRing>
    </>
  )
}
const ringScene: SceneLoader = async () => ({ default: RingScene })

const liveItems = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', live: true },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', state: 'pending' as const },
]

export const examples: GalleryExample[] = [
  {
    id: 'poster-procedural',
    title: 'PosterFallback (procedural)',
    description: 'No image: a token gradient, so the slot is never empty.',
    render: () => (
      <div style={{ position: 'relative', aspectRatio: '16 / 9' }}>
        <PosterFallback />
      </div>
    ),
  },
  {
    id: 'lazy3d-core',
    title: 'Lazy3D + FresnelCore',
    description: 'Poster first; the core mounts only after load + idle, in view, WebGL2, quality not off and no focused field.',
    render: () => <Lazy3D scene={coreScene} poster={{}} ratio="16 / 9" />,
  },
  {
    id: 'lazy3d-ring',
    title: 'Lazy3D + OrbitRing',
    description: 'A small decorative scene allowed down to 768px.',
    render: () => <Lazy3D scene={ringScene} poster={{}} minWidth={768} ratio="4 / 3" />,
  },
  {
    id: 'status-orbit-fallback',
    title: 'StatusOrbit (fallback list, never lit)',
    description: 'No status supplied: every platform reads "Status not confirmed".',
    render: () => <StatusOrbit poster={{}} />,
  },
  {
    id: 'status-orbit-live',
    title: 'StatusOrbit (status-derived)',
    description: 'Only live: true platforms are lit; the same states are in the DOM list.',
    render: () => (
      <>
        <StatusOrbit poster={{}} items={liveItems} />
        <StatusOrbitList items={liveItems} visible label="Publishing status (visible copy)" />
      </>
    ),
  },
  {
    id: 'lazy3d-refused',
    title: 'Lazy3D under data-surface="money"',
    description: 'Refuses to mount on money, auth, legal and admin surfaces; the poster stays.',
    render: () => (
      <div data-surface="money">
        <Lazy3D scene={coreScene} poster={{}} />
      </div>
    ),
  },
]
