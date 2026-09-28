import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Group } from 'three'
import { pointerTilt, ringScale } from '../statusCards'
import type { SceneProps, StatusOrbitSceneProps } from '../types'
import { FresnelCore } from './FresnelCore'
import { StatusOrbitCards } from './StatusOrbitCards'

/**
 * Tilts its children toward the pointer, capped at ±4° (spec §6.3 rule 3). The scene rotates in
 * place, so there is no camera translation. Listens on window because decorative canvases have
 * pointer-events: none.
 */
export function PointerTilt({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const group = useRef<Group>(null)
  const target = useRef({ yaw: 0, pitch: 0 })
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const onMove = (e: PointerEvent) => {
      target.current.yaw = pointerTilt(e.clientX / (window.innerWidth || 1))
      target.current.pitch = -pointerTilt(e.clientY / (window.innerHeight || 1))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
  useFrame((_s, delta) => {
    const g = group.current
    if (!g) return
    const k = Math.min(1, delta * 3.6)
    g.rotation.y += (target.current.yaw - g.rotation.y) * k
    g.rotation.x += (target.current.pitch - g.rotation.x) * k
  })
  return <group ref={group}>{children}</group>
}

/** Scroll draws the rings in (hero-3d.js: to ~70% over the first 600px). */
function useScrollTightness(): number {
  const [t, setT] = useState(() => (typeof window === 'undefined' ? 1 : ringScale(window.scrollY)))
  useEffect(() => {
    const onScroll = () => setT(ringScale(window.scrollY))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return t
}

/**
 * The WMH hero scene: FresnelCore plus the two status-card rings (spec §6.7). Honesty-gated:
 * a card is lit only for a `live: true` platform item.
 */
export function StatusOrbitScene({ items, center = [0, 0, 0], quality = 'high', animate = true, tightness }: StatusOrbitSceneProps & Partial<SceneProps>) {
  const scrollTight = useScrollTightness()
  return (
    <PointerTilt enabled={animate}>
      <group position={center}>
        <FresnelCore animate={animate} segments={quality === 'high' ? 40 : 24} />
        <StatusOrbitCards items={items} animate={animate} tightness={tightness ?? scrollTight} />
      </group>
    </PointerTilt>
  )
}
