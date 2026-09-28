/**
 * Public types for @trident/ui/three. Written without three.js types so the light entry's .d.ts
 * does not require the optional peers to be installed.
 */
import type { ComponentType, ReactNode } from 'react'
import type { StatusCard, StatusOrbitItem } from './statusCards'

/** Why a mounted scene fell back to its poster. */
export type FallbackReason = 'context-lost' | 'error' | 'performance'

export interface SceneCanvasProps {
  children?: ReactNode
  /** false while off-screen or the tab is hidden: frameloop 'never'. */
  active?: boolean
  /** Interactive scenes receive pointer events; decorative ones (the default) never do. */
  interactive?: boolean
  /** Continuous frames for this long, then frameloop 'demand' (spec: 8s). */
  idleMs?: number
  /** Swap to the poster. Called at most once. */
  onFallback?: (reason: FallbackReason) => void
  /** Camera field of view and position; defaults suit the hero scenes. */
  camera?: { fov?: number; position?: [number, number, number] }
  className?: string
}

export interface FresnelCoreProps {
  radius?: number
  position?: [number, number, number]
  /** Colour roles (read with useTokenColor) for the two bands and the rim. */
  colorRole?: string
  secondaryRole?: string
  rimColor?: number
  /** Halo billboard behind the core. */
  halo?: boolean
  /** Band drift and spin. Off freezes the core. */
  animate?: boolean
  segments?: number
}

export interface OrbitRingProps {
  children?: ReactNode
  radius?: number
  /** Z tilt and X lean of the ring plane, in radians (hero-3d: -0.24/1.08 and 0.38/1.22). */
  tilt?: number
  lean?: number
  /** Radians per second; negative spins the other way. */
  speed?: number
  /** Children face the camera (the hero's cards do). */
  billboard?: boolean
  /** Scale applied to the radius (the hero draws rings in on scroll). */
  tightness?: number
  animate?: boolean
  /** Vertical bob amplitude per slot. */
  bob?: number
  /** Draws the ring path as a faint line. */
  showPath?: boolean
  pathColorRole?: string
}

export interface StatusOrbitCardsProps {
  items?: readonly StatusOrbitItem[] | null
  animate?: boolean
  tightness?: number
}

export interface StatusOrbitSceneProps extends StatusOrbitCardsProps {
  /** Scene centre (the hero offsets the orbit right of the H1). */
  center?: [number, number, number]
}

/**
 * The R3F primitives, loaded in a separate chunk only after every Lazy3D gate passes. Scenes get
 * them as the `kit` prop, so a scene module never imports three/R3F into the page's initial graph
 * through this entry.
 */
export interface SceneKit {
  SceneCanvas: ComponentType<SceneCanvasProps>
  FresnelCore: ComponentType<FresnelCoreProps>
  OrbitRing: ComponentType<OrbitRingProps>
  StatusOrbitCards: ComponentType<StatusOrbitCardsProps>
  StatusOrbitScene: ComponentType<StatusOrbitSceneProps & SceneProps>
}

/** Props every Lazy3D scene component receives. */
export interface SceneProps {
  kit: SceneKit
  /** 'low' or 'high' (a mounted scene is never 'off'). Low: fewer particles, no idle drift. */
  quality: 'low' | 'high'
}

export type SceneModule<P extends object = object> = { default: ComponentType<SceneProps & P> }
export type SceneLoader<P extends object = object> = () => Promise<SceneModule<P>>

export type { StatusCard, StatusOrbitItem }
