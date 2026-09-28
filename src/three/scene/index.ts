/**
 * The R3F half of @trident/ui/three. Everything here imports three / @react-three/fiber /
 * @react-three/drei, so it is reached ONLY through the dynamic import in <Lazy3D> (a separate
 * chunk that is never in the page's initial graph and never modulepreloaded). Scenes receive it
 * as the `kit` prop. drei imports must come from the spec §6.5 allow-list (enforced by a test).
 */
import type { SceneKit } from '../types'
import { FresnelCore } from './FresnelCore'
import { OrbitRing } from './OrbitRing'
import { SceneCanvas } from './SceneCanvas'
import { StatusOrbitCards } from './StatusOrbitCards'
import { StatusOrbitScene } from './StatusOrbitScene'

export { FresnelCore, OrbitRing, SceneCanvas, StatusOrbitCards, StatusOrbitScene }
export { PointerTilt } from './StatusOrbitScene'
export { INNER_RING, OUTER_RING, slotAngle } from './OrbitRing'
export { DPR_RANGE, GL_OPTIONS, IDLE_MS, frameloopFor } from './SceneCanvas'

export const sceneKit: SceneKit = Object.freeze({ SceneCanvas, FresnelCore, OrbitRing, StatusOrbitCards, StatusOrbitScene })
