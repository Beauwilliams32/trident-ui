import { useFrame } from '@react-three/fiber'
import { Children, useRef } from 'react'
import { Quaternion, type Group } from 'three'
import type { OrbitRingProps } from '../types'
import { useTokenColor } from '../useTokenColor'

/** One ring from hero-3d.js: the inner ring is -0.24/1.08 at 1.85, 46s per turn. */
export const INNER_RING = Object.freeze({ radius: 1.85, tilt: -0.24, lean: 1.08, speed: (Math.PI * 2) / 46 })
/** The outer ring: 0.38/1.22 at 2.55, 62s per turn the other way. */
export const OUTER_RING = Object.freeze({ radius: 2.55, tilt: 0.38, lean: 1.22, speed: -(Math.PI * 2) / 62 })

/** Angle of slot `i` of `n` at time `t` (hero-3d.js: speed * t + slot / n * 2π). */
export function slotAngle(i: number, n: number, t: number, speed: number): number {
  return speed * t + (i / Math.max(1, n)) * Math.PI * 2
}

const parentQuat = new Quaternion()

function RingPath({ radius, colorRole }: { radius: number; colorRole: string }) {
  const color = useTokenColor(colorRole)
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 4, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  )
}

/**
 * Places its children evenly on a tilted ring and orbits them (a port of the hero-3d.js rings).
 * Children face the camera by default, bob gently, and the radius scales with `tightness`.
 */
export function OrbitRing({
  children,
  radius = INNER_RING.radius,
  tilt = INNER_RING.tilt,
  lean = INNER_RING.lean,
  speed = INNER_RING.speed,
  billboard = true,
  tightness = 1,
  animate = true,
  bob = 0.07,
  showPath = false,
  pathColorRole = 'line-strong',
}: OrbitRingProps) {
  const items = Children.toArray(children)
  const slots = useRef<Array<Group | null>>([])
  const faces = useRef<Array<Group | null>>([])
  const time = useRef(0)
  const tight = useRef(tightness)

  useFrame((state, delta) => {
    if (animate) time.current += delta
    tight.current += (tightness - tight.current) * Math.min(1, delta * 6)
    const t = time.current
    const r = radius * tight.current
    const n = items.length
    for (let i = 0; i < n; i++) {
      const slot = slots.current[i]
      if (!slot) continue
      const a = slotAngle(i, n, t, speed)
      slot.position.set(Math.cos(a) * r, animate ? Math.sin(t * 0.9 + i * 1.7) * bob : 0, Math.sin(a) * r)
      const face = faces.current[i]
      if (billboard && face && face.parent) {
        face.parent.getWorldQuaternion(parentQuat).invert()
        face.quaternion.copy(parentQuat).multiply(state.camera.quaternion)
      }
    }
  })

  return (
    <group rotation={[0, 0, tilt]}>
      <group rotation={[lean, 0, 0]}>
        {showPath ? <RingPath radius={radius * tightness} colorRole={pathColorRole} /> : null}
        {items.map((child, i) => (
          <group
            key={i}
            position={[Math.cos(slotAngle(i, items.length, 0, speed)) * radius * tightness, 0, Math.sin(slotAngle(i, items.length, 0, speed)) * radius * tightness]}
            ref={(g) => {
              slots.current[i] = g
            }}
          >
            <group
              ref={(g) => {
                faces.current[i] = g
              }}
            >
              {child}
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}
