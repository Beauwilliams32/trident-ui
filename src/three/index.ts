/**
 * @trident/ui/three — the 3D slot (spec §6.5). three / @react-three/fiber / @react-three/drei are
 * OPTIONAL peers, so this is a subpath entry and is not re-exported from the package root.
 *
 * This entry is light: it never imports three, R3F or drei statically (a test walks the import
 * graph to prove it). The R3F primitives (SceneCanvas, FresnelCore, OrbitRing, StatusOrbitCards,
 * StatusOrbitScene) live in ./scene and load as a separate chunk only after every <Lazy3D> gate
 * passes; scenes receive them as the `kit` prop. Assets are procedural or owned only.
 */
export { Lazy3D, type Lazy3DProps, type Lazy3DState } from './Lazy3D'
export { PosterFallback, type PosterFallbackProps } from './PosterFallback'
export { StatusOrbit, StatusOrbitList, type StatusOrbitListProps, type StatusOrbitProps } from './StatusOrbit'
export { useQualityTier, readQualityTier, reportPerformanceDecline, resetPerformanceDecline } from './useQualityTier'
export { useTokenColor, useBrandColors, readTokenColor, readBrandColors, ThemeScopeContext, UNRESOLVED_COLOR, type TokenColorOptions } from './useTokenColor'
export { loadGeneratedColors, parseCssColor, intToRgb, DEFAULT_THEME, type ThreeColorMap } from './colors'
export {
  computeQualityTier,
  forbiddenSurface,
  hasWebGL2,
  isFormField,
  lowPower,
  FORBIDDEN_SURFACES,
  HERO_MIN_WIDTH,
  SMALL_SCENE_MIN_WIDTH,
  type QualityInputs,
  type QualityTier,
} from './env'
export {
  statusCards,
  cardState,
  stateText,
  ringScale,
  pointerTilt,
  FALLBACK_STATUS_ITEMS,
  MAX_STATUS_CARDS,
  MAX_POINTER_TILT,
  type StatusCardState,
} from './statusCards'
export { FpsGuard } from './fpsGuard'
export type {
  FallbackReason,
  FresnelCoreProps,
  OrbitRingProps,
  SceneCanvasProps,
  SceneKit,
  SceneLoader,
  SceneModule,
  SceneProps,
  StatusCard,
  StatusOrbitCardsProps,
  StatusOrbitItem,
  StatusOrbitSceneProps,
} from './types'

/** Load the R3F primitives yourself (e.g. to pre-warm after a user gesture). Never call at import. */
export const loadSceneKit = () => import('./scene/index').then((m) => m.sceneKit)
