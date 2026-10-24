import * as react from 'react';
import { ComponentType, ReactNode, CSSProperties } from 'react';

/**
 * StatusOrbit honesty rules (spec §6.3 rule 9, §6.5, §10.10), ported from
 * williams-media-portal/src/public/app/hero-3d.js chipList()/cardState(). Pure; shared by the
 * DOM list and the 3D cards so the two can never disagree.
 *
 * A platform card is LIT only when the caller passes `live: true` (literally the boolean), which a
 * consumer derives from `/api/public/platform-status`. Workflow cards are never lit. The built-in
 * fallback list never lights anything: this package cannot know what publishes.
 */
interface StatusOrbitItem {
    id?: string;
    label: string;
    /** Brand dot colour. Decorative only; state is always carried by text too. */
    color?: string;
    kind?: 'platform' | 'workflow';
    /** Lit only when exactly `true`, and only for platforms. */
    live?: boolean;
    /** Known-but-not-live state from the status API. Anything else reads as unknown. */
    state?: 'pending' | 'unknown' | 'workflow';
}
type StatusCardState = 'live' | 'pending' | 'unknown' | 'workflow';
interface StatusCard {
    key: string;
    label: string;
    color: string;
    kind: 'platform' | 'workflow';
    live: boolean;
    state: StatusCardState;
}
declare const MAX_STATUS_CARDS = 10;
/** The eight marketed platforms (state unknown, never lit) plus the two workflow cards. */
declare const FALLBACK_STATUS_ITEMS: readonly StatusOrbitItem[];
declare function cardState(item: StatusOrbitItem | null | undefined): StatusCardState;
/**
 * Caller items first, then the fallback fills the gaps; de-duplicated by id (or label), capped at
 * MAX_STATUS_CARDS. `live` survives only when it is literally `true` on a platform item.
 */
declare function statusCards(items?: readonly StatusOrbitItem[] | null): StatusCard[];
/** Text for the DOM list (and the card's second line). State never relies on colour alone. */
declare function stateText(state: StatusCardState): string;
/**
 * Ring radius multiplier for a scroll offset (hero-3d.js ringScale): 1 at the top, easing to
 * `minScale` over the first `span` px (smoothstep, clamped).
 */
declare function ringScale(scrollY: number, span?: number, minScale?: number): number;
/** Pointer/scroll camera movement inside a decorative canvas is capped at ±4° (spec §6.3 rule 3). */
declare const MAX_POINTER_TILT: number;
/** Pointer position (0..1 across the viewport) to a tilt within ±MAX_POINTER_TILT. */
declare function pointerTilt(fraction: number): number;

/**
 * Public types for @trident/ui/three. Written without three.js types so the light entry's .d.ts
 * does not require the optional peers to be installed.
 */

/** Why a mounted scene fell back to its poster. */
type FallbackReason = 'context-lost' | 'error' | 'performance';
interface SceneCanvasProps {
    children?: ReactNode;
    /** false while off-screen or the tab is hidden: frameloop 'never'. */
    active?: boolean;
    /** Interactive scenes receive pointer events; decorative ones (the default) never do. */
    interactive?: boolean;
    /** Continuous frames for this long, then frameloop 'demand' (spec: 8s). */
    idleMs?: number;
    /** Swap to the poster. Called at most once. */
    onFallback?: (reason: FallbackReason) => void;
    /** Camera field of view and position; defaults suit the hero scenes. */
    camera?: {
        fov?: number;
        position?: [number, number, number];
    };
    className?: string;
}
interface FresnelCoreProps {
    radius?: number;
    position?: [number, number, number];
    /** Colour roles (read with useTokenColor) for the two bands and the rim. */
    colorRole?: string;
    secondaryRole?: string;
    rimColor?: number;
    /** Halo billboard behind the core. */
    halo?: boolean;
    /** Band drift and spin. Off freezes the core. */
    animate?: boolean;
    segments?: number;
}
interface OrbitRingProps {
    children?: ReactNode;
    radius?: number;
    /** Z tilt and X lean of the ring plane, in radians (hero-3d: -0.24/1.08 and 0.38/1.22). */
    tilt?: number;
    lean?: number;
    /** Radians per second; negative spins the other way. */
    speed?: number;
    /** Children face the camera (the hero's cards do). */
    billboard?: boolean;
    /** Scale applied to the radius (the hero draws rings in on scroll). */
    tightness?: number;
    animate?: boolean;
    /** Vertical bob amplitude per slot. */
    bob?: number;
    /** Draws the ring path as a faint line. */
    showPath?: boolean;
    pathColorRole?: string;
}
interface StatusOrbitCardsProps {
    items?: readonly StatusOrbitItem[] | null;
    animate?: boolean;
    tightness?: number;
}
interface StatusOrbitSceneProps extends StatusOrbitCardsProps {
    /** Scene centre (the hero offsets the orbit right of the H1). */
    center?: [number, number, number];
}
/**
 * The R3F primitives, loaded in a separate chunk only after every Lazy3D gate passes. Scenes get
 * them as the `kit` prop, so a scene module never imports three/R3F into the page's initial graph
 * through this entry.
 */
interface SceneKit {
    SceneCanvas: ComponentType<SceneCanvasProps>;
    FresnelCore: ComponentType<FresnelCoreProps>;
    OrbitRing: ComponentType<OrbitRingProps>;
    StatusOrbitCards: ComponentType<StatusOrbitCardsProps>;
    StatusOrbitScene: ComponentType<StatusOrbitSceneProps & SceneProps>;
}
/** Props every Lazy3D scene component receives. */
interface SceneProps {
    kit: SceneKit;
    /** 'low' or 'high' (a mounted scene is never 'off'). Low: fewer particles, no idle drift. */
    quality: 'low' | 'high';
}
type SceneModule<P extends object = object> = {
    default: ComponentType<SceneProps & P>;
};
type SceneLoader<P extends object = object> = () => Promise<SceneModule<P>>;

interface PosterFallbackProps {
    /** Fallback image (WebP or PNG). Rendered locally by `trident-ui poster`; owned assets only. */
    src?: string;
    /** AVIF / WebP sources, tried before `src`. */
    avif?: string;
    webp?: string;
    /** 3D is decorative, so the poster is too: empty alt by default. Pass alt text only if it carries meaning. */
    alt?: string;
    width?: number;
    height?: number;
    /** Eager-load when the poster is above the fold. Never the LCP element (spec §6.7). */
    eager?: boolean;
    /**
     * The image's `loading` attribute. Overrides `eager` when given (`eager` stays for compatibility).
     */
    loading?: 'eager' | 'lazy';
    /**
     * The image's fetch priority. Pass "low" for an above-the-fold decorative backdrop so it never
     * competes with the CSS and fonts that paint a text H1 (the Ops landing hero).
     */
    fetchPriority?: 'high' | 'low' | 'auto';
    className?: string;
    style?: CSSProperties;
    /** Custom poster markup instead of an image. */
    children?: ReactNode;
}
/**
 * The poster that paints first and stays whenever 3D does not mount (spec §6.5). With no image it
 * paints a procedural token gradient, so it is never empty. SSR-safe; zero JS behaviour.
 */
declare function PosterFallback({ src, avif, webp, alt, width, height, eager, loading, fetchPriority, className, style, children }: PosterFallbackProps): react.JSX.Element;

/** Where a Lazy3D slot is in its life. Exposed as `data-state` for tests and CSS. */
type Lazy3DState = 'poster' | 'refused' | 'unsupported' | 'loading' | 'live' | 'failed';
interface Lazy3DProps<P extends object = object> {
    /** `() => import('./my-scene')`; the module's default export receives `kit`, `quality` and `sceneProps`. */
    scene: SceneLoader<P>;
    sceneProps?: P;
    /** Painted first and kept whenever 3D does not mount: an image URL, PosterFallback props, or markup. */
    poster: string | PosterFallbackProps | ReactNode;
    /** Minimum viewport width for the canvas. 980 for heroes; small scenes may pass 768 (spec §0.2). */
    minWidth?: number;
    /** Fixed aspect ratio of the slot (CLS 0). Number (width / height) or a CSS ratio string. */
    ratio?: number | string;
    /** Only interactive scenes receive pointer events; they must also offer DOM/keyboard alternatives. */
    interactive?: boolean;
    /** Continuous frames for this long after mount, then an on-demand loop. */
    idleMs?: number;
    /** DOM equivalents of anything the scene shows (spec §6.8, §9). Rendered whether or not 3D mounts. */
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onStateChange?: (state: Lazy3DState) => void;
}
/**
 * The ONLY way to mount a canvas (spec §6.5). The canvas mounts only when every gate holds:
 * after `load` plus an idle callback; the slot intersects the viewport and the document is
 * visible; WebGL2 exists; `useQualityTier() !== 'off'` (reduced motion, Pause and lowPower all
 * make it off); the viewport is at least `minWidth`; no form field has focus; and the slot is not
 * inside `[data-surface="money|auth|legal|admin"]`. Otherwise the poster, painted first, stays.
 * The three/R3F code is a separate chunk that is imported only once the gates pass.
 */
declare function Lazy3D<P extends object = object>({ scene, sceneProps, poster, minWidth, ratio, interactive, idleMs, children, className, style, onStateChange, }: Lazy3DProps<P>): react.JSX.Element;

interface StatusOrbitListProps {
    items?: readonly StatusOrbitItem[] | null;
    /** Accessible name of the list. */
    label?: string;
    /** Show the list on screen instead of visually hiding it. */
    visible?: boolean;
}
/**
 * The DOM equivalent of the orbit (spec §6.5, §9): every card's label and state as text, so 3D
 * never carries information the DOM does not. Visually hidden by default.
 */
declare function StatusOrbitList({ items, label, visible }: StatusOrbitListProps): react.JSX.Element;
interface StatusOrbitProps extends Omit<Lazy3DProps<StatusOrbitSceneProps>, 'scene' | 'sceneProps' | 'children'> {
    /** Status-derived items. Only `live: true` platform items are lit; omit to show the never-lit fallback. */
    items?: readonly StatusOrbitItem[] | null;
    center?: [number, number, number];
    listLabel?: string;
    children?: ReactNode;
}
/**
 * The WMH hero orbit (a port of hero-3d.js): fresnel core, two tilted rings and status cards,
 * mounted through `<Lazy3D>`, with the visually hidden DOM list always rendered.
 */
declare function StatusOrbit({ items, center, listLabel, children, ...lazy }: StatusOrbitProps): react.JSX.Element;

/**
 * Browser probes for the 3D gates (spec §6.4, §6.5). Every function is safe to call during SSR
 * (it returns the conservative answer) and nothing here touches `window` at import time.
 */
type QualityTier = 'off' | 'low' | 'high';
/** Viewport widths from spec §0.2: heroes need 980px; small scenes may go down to 768px. */
declare const HERO_MIN_WIDTH = 980;
declare const SMALL_SCENE_MIN_WIDTH = 768;
/** `[data-surface]` values where `<Lazy3D>` refuses to mount (spec §6.8). */
declare const FORBIDDEN_SURFACES: readonly ["money", "auth", "legal", "admin"];
interface NetworkInformationLike {
    saveData?: boolean;
    effectiveType?: string;
}
interface NavigatorLike {
    connection?: NetworkInformationLike;
    deviceMemory?: number;
    hardwareConcurrency?: number;
}
/**
 * Same thresholds as 07-motion.js (spec §0.2): Save-Data, deviceMemory < 4,
 * hardwareConcurrency < 4, or an effective connection type of 2g (or slow-2g).
 */
declare function lowPower(nav?: NavigatorLike | undefined): boolean;
/**
 * WebGL2 availability. Only call this after the quality tier is known not to be 'off': the probe
 * creates (and immediately releases) a throwaway WebGL2 context.
 */
declare function hasWebGL2(): boolean;
/** True for elements that count as "a form field has focus" (spec §6.8: no 3D while one does). */
declare function isFormField(el: Element | null | undefined): boolean;
/** The forbidden `[data-surface]` an element sits under, if any. */
declare function forbiddenSurface(el: Element | null | undefined): string | null;
interface QualityInputs {
    reducedMotion: boolean;
    paused: boolean;
    lowPower: boolean;
    width: number;
    coarsePointer: boolean;
    performanceDeclined: boolean;
}
/**
 * The tier rules (spec §6.4, §6.5). 'off' means no WebGL context may be created at all:
 * reduced motion, Pause, lowPower (which "applies the 3D rule too"), or a viewport below 768px.
 * 'low' covers the 768–979px band, coarse pointers and a PerformanceMonitor step-down.
 */
declare function computeQualityTier(i: QualityInputs): QualityTier;

/** Called by `<SceneCanvas>` when PerformanceMonitor steps down past the dpr stage. */
declare function reportPerformanceDecline(): void;
/** Test hook: clear the page-wide performance step-down. */
declare function resetPerformanceDecline(): void;
/** Current tier, computed from live browser state. 'off' during SSR. */
declare function readQualityTier(): QualityTier;
/**
 * `off` | `low` | `high` (spec §6.5), from reduced motion, lowPower, viewport width,
 * PerformanceMonitor and the Pause state. `off` means no WebGL context may be created.
 * Always `off` on the server and during hydration, so SSR renders the poster.
 */
declare function useQualityTier(): QualityTier;

/** Theme names that have generated colours. */
declare const threeThemeNames: readonly string[];
/**
 * Resolved hex roles for a theme (and optional `data-portal-palette`) as 0xRRGGBB ints.
 * Unknown themes fall back to trident-studio; unknown palettes are ignored.
 */
declare function generatedColors(theme?: string, palette?: string): ThreeColorMap;

declare const Generated_generatedColors: typeof generatedColors;
declare const Generated_threeThemeNames: typeof threeThemeNames;
declare namespace Generated {
  export { Generated_generatedColors as generatedColors, Generated_threeThemeNames as threeThemeNames };
}

/**
 * Colour helpers for the light @trident/ui/three entry. The generated per-theme map (which carries
 * the precomputed token colour table) is a separate chunk: loadGeneratedColors() fetches it, and <Lazy3D> loads it
 * together with the scene kit, so it is always present by the time a scene renders.
 */

declare const DEFAULT_THEME = "trident-studio";
type ThreeColorMap = Readonly<Record<string, number>>;
/**
 * Parse a computed CSS colour (`#rgb`, `#rrggbb`, `rgb()`/`rgba()`) into a 0xRRGGBB int.
 * Anything else (color-mix(), gradients, empty) returns null so callers use the generated value.
 */
declare function parseCssColor(value: string | null | undefined): number | null;
/** 0xRRGGBB -> [r, g, b] in 0..1 (for shader uniforms). */
declare function intToRgb(n: number): [number, number, number];
/** Fetch the generated colour map (once). Resolves to the module with generatedColors(). */
declare function loadGeneratedColors(): Promise<typeof Generated>;

/**
 * The element whose theme a scene should read. `<Lazy3D>` provides its own container, so a scene
 * inside a nested `[data-theme]` (the gallery, a themed card) picks up that theme. R3F 9 bridges
 * React context into the canvas, so hooks inside the scene see it too.
 */
declare const ThemeScopeContext: react.Context<Element | null>;
interface TokenColorOptions {
    /** Force a theme instead of reading `[data-theme]` from the DOM. */
    theme?: string;
    /** Force a `data-portal-palette` variant. */
    palette?: string;
}
/** Returned for a role before the generated map has loaded and no CSS value is available. */
declare const UNRESOLVED_COLOR = 16777215;
/**
 * One role as a 0xRRGGBB int. Runtime first (the computed `--ui-<role>` custom property, so a
 * tenant accent passed through ensureContrast wins), falling back to the generated
 * `@trident/ui/three.mjs` value for the active theme. Never reads the DOM during SSR.
 */
declare function readTokenColor(role: string, scope?: Element | null, opts?: TokenColorOptions): number;
/** Every hex role of the active theme as ints, runtime values layered over generated ones. */
declare function readBrandColors(scope?: Element | null, opts?: TokenColorOptions): ThreeColorMap;
/** A single brand/role colour for three.js, e.g. `useTokenColor('accent-1')`. */
declare function useTokenColor(role: string, opts?: TokenColorOptions): number;
/** All hex roles of the active theme (bg, ink, accent-1, accent-2, status-live, ...) as ints. */
declare function useBrandColors(opts?: TokenColorOptions): ThreeColorMap;

/**
 * Sustained-low-frame-rate detector for `<SceneCanvas>` (spec §6.5: swap to the poster below
 * 40fps for 3s). Frame deltas are grouped into ~0.5s buckets; the guard trips once consecutive
 * low buckets add up to `windowMs`. A single long gap (tab switch, demand loop) resets it instead
 * of counting as slowness. Pure and framework-free, so it is unit-tested directly.
 */
declare class FpsGuard {
    readonly minFps: number;
    readonly windowMs: number;
    readonly bucketMs: number;
    readonly maxGapMs: number;
    private bucketTime;
    private bucketFrames;
    private lowTime;
    private trippedFlag;
    constructor(minFps?: number, windowMs?: number, bucketMs?: number, maxGapMs?: number);
    get tripped(): boolean;
    /** Feed one frame's delta in seconds. Returns true once the guard has tripped. */
    push(deltaSeconds: number): boolean;
    reset(): void;
}

/** Load the R3F primitives yourself (e.g. to pre-warm after a user gesture). Never call at import. */
declare const loadSceneKit: () => Promise<SceneKit>;

export { DEFAULT_THEME, FALLBACK_STATUS_ITEMS, FORBIDDEN_SURFACES, type FallbackReason, FpsGuard, type FresnelCoreProps, HERO_MIN_WIDTH, Lazy3D, type Lazy3DProps, type Lazy3DState, MAX_POINTER_TILT, MAX_STATUS_CARDS, type OrbitRingProps, PosterFallback, type PosterFallbackProps, type QualityInputs, type QualityTier, SMALL_SCENE_MIN_WIDTH, type SceneCanvasProps, type SceneKit, type SceneLoader, type SceneModule, type SceneProps, type StatusCard, type StatusCardState, StatusOrbit, type StatusOrbitCardsProps, type StatusOrbitItem, StatusOrbitList, type StatusOrbitListProps, type StatusOrbitProps, type StatusOrbitSceneProps, ThemeScopeContext, type ThreeColorMap, type TokenColorOptions, UNRESOLVED_COLOR, cardState, computeQualityTier, forbiddenSurface, hasWebGL2, intToRgb, isFormField, loadGeneratedColors, loadSceneKit, lowPower, parseCssColor, pointerTilt, readBrandColors, readQualityTier, readTokenColor, reportPerformanceDecline, resetPerformanceDecline, ringScale, stateText, statusCards, useBrandColors, useQualityTier, useTokenColor };
