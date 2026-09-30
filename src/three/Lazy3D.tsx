import { isValidElement, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { loadGeneratedColors } from './colors'
import { forbiddenSurface, formFieldFocused, hasWebGL2, HERO_MIN_WIDTH, isBrowser, isFormField, viewportWidth } from './env'
import { PosterFallback, type PosterFallbackProps } from './PosterFallback'
import type { FallbackReason, SceneKit, SceneLoader, SceneProps } from './types'
import { useQualityTier } from './useQualityTier'
import { ThemeScopeContext } from './useTokenColor'

/** Where a Lazy3D slot is in its life. Exposed as `data-state` for tests and CSS. */
export type Lazy3DState = 'poster' | 'refused' | 'unsupported' | 'loading' | 'live' | 'failed'

export interface Lazy3DProps<P extends object = object> {
  /** `() => import('./my-scene')`; the module's default export receives `kit`, `quality` and `sceneProps`. */
  scene: SceneLoader<P>
  sceneProps?: P
  /** Painted first and kept whenever 3D does not mount: an image URL, PosterFallback props, or markup. */
  poster: string | PosterFallbackProps | ReactNode
  /** Minimum viewport width for the canvas. 980 for heroes; small scenes may pass 768 (spec §0.2). */
  minWidth?: number
  /** Fixed aspect ratio of the slot (CLS 0). Number (width / height) or a CSS ratio string. */
  ratio?: number | string
  /** Only interactive scenes receive pointer events; they must also offer DOM/keyboard alternatives. */
  interactive?: boolean
  /** Continuous frames for this long after mount, then an on-demand loop. */
  idleMs?: number
  /** DOM equivalents of anything the scene shows (spec §6.8, §9). Rendered whether or not 3D mounts. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onStateChange?: (state: Lazy3DState) => void
}

type Loaded<P extends object> = { kit: SceneKit; Scene: ComponentType<SceneProps & P> }

/** Resolves after `load` and then an idle callback (spec §6.5). Returns a cancel function. */
function afterLoadAndIdle(cb: () => void): () => void {
  let cancelled = false
  let idleId: number | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const idle = () => {
    if (cancelled) return
    const w = window as Window & { requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number }
    if (typeof w.requestIdleCallback === 'function') idleId = w.requestIdleCallback(() => !cancelled && cb(), { timeout: 2000 })
    else timeoutId = setTimeout(() => !cancelled && cb(), 200)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener('load', idle)
    const w = window as Window & { cancelIdleCallback?: (id: number) => void }
    if (idleId !== undefined && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId)
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

function subscribeResize(cb: () => void): () => void {
  if (!isBrowser()) return () => {}
  window.addEventListener('resize', cb, { passive: true })
  return () => window.removeEventListener('resize', cb)
}

function renderPoster(poster: Lazy3DProps['poster']): ReactNode {
  if (typeof poster === 'string') return <PosterFallback src={poster} />
  if (poster && typeof poster === 'object' && !isValidElement(poster) && !Array.isArray(poster)) {
    return <PosterFallback {...(poster as PosterFallbackProps)} />
  }
  return (poster as ReactNode) ?? <PosterFallback />
}

function ratioStyle(ratio: number | string | undefined): string {
  if (typeof ratio === 'number' && ratio > 0) return String(ratio)
  if (typeof ratio === 'string' && ratio.trim()) return ratio
  return '16 / 9'
}

/**
 * The ONLY way to mount a canvas (spec §6.5). The canvas mounts only when every gate holds:
 * after `load` plus an idle callback; the slot intersects the viewport and the document is
 * visible; WebGL2 exists; `useQualityTier() !== 'off'` (reduced motion, Pause and lowPower all
 * make it off); the viewport is at least `minWidth`; no form field has focus; and the slot is not
 * inside `[data-surface="money|auth|legal|admin"]`. Otherwise the poster, painted first, stays.
 * The three/R3F code is a separate chunk that is imported only once the gates pass.
 */
export function Lazy3D<P extends object = object>({
  scene,
  sceneProps,
  poster,
  minWidth = HERO_MIN_WIDTH,
  ratio,
  interactive = false,
  idleMs,
  children,
  className,
  style,
  onStateChange,
}: Lazy3DProps<P>) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const tier = useQualityTier()
  const wide = useSyncExternalStore(
    subscribeResize,
    () => viewportWidth() >= minWidth,
    () => false,
  )
  const [refused, setRefused] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(false)
  const [docVisible, setDocVisible] = useState(false)
  const [fieldFocused, setFieldFocused] = useState(false)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [failed, setFailed] = useState(false)
  const [everShown, setEverShown] = useState(false)
  const [loaded, setLoaded] = useState<Loaded<P> | null>(null)
  // Consumers usually pass an inline `() => import(...)`; keep the latest without restarting loads.
  const sceneRef = useRef(scene)
  useEffect(() => {
    sceneRef.current = scene
  })

  // Forbidden surfaces: decided once the element exists (never during SSR).
  useEffect(() => {
    if (!el) return
    const surface = forbiddenSurface(el)
    setRefused(surface)
    if (surface) console.warn(`[@trident/ui] <Lazy3D> refused to mount under [data-surface="${surface}"] (spec §6.8).`)
  }, [el])

  // load + idle.
  useEffect(() => {
    if (!isBrowser()) return
    return afterLoadAndIdle(() => setReady(true))
  }, [])

  // In view (IntersectionObserver) and document visible.
  useEffect(() => {
    if (!el) return
    const onVis = () => setDocVisible(document.visibilityState === 'visible')
    onVis()
    document.addEventListener('visibilitychange', onVis)
    let io: IntersectionObserver | undefined
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: 0.01 })
      io.observe(el)
    } else {
      setInView(true)
    }
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      io?.disconnect()
    }
  }, [el])

  // No 3D while a form field has focus.
  useEffect(() => {
    if (!isBrowser()) return
    setFieldFocused(formFieldFocused())
    const onIn = (e: FocusEvent) => setFieldFocused(isFormField(e.target as Element | null))
    const onOut = (e: FocusEvent) => setFieldFocused(isFormField(e.relatedTarget as Element | null))
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  const allowed = !!el && refused === null && tier !== 'off' && wide && ready && !fieldFocused && !failed
  const visibleNow = inView && docVisible
  // The first mount needs the slot on screen; after that, going off-screen only stops the frameloop.
  const candidate = allowed && (everShown || visibleNow)

  // WebGL2 probe runs only once every cheaper gate has passed (it creates a throwaway context).
  useEffect(() => {
    if (candidate && webgl === null) setWebgl(hasWebGL2())
  }, [candidate, webgl])

  const mount = candidate && webgl === true

  useEffect(() => {
    if (mount && !everShown) setEverShown(true)
  }, [mount, everShown])

  useEffect(() => {
    if (!mount || loaded) return
    let cancelled = false
    Promise.all([import('./scene/index'), sceneRef.current(), loadGeneratedColors()])
      .then(([kitModule, sceneModule]) => {
        if (cancelled) return
        setLoaded({ kit: kitModule.sceneKit, Scene: sceneModule.default })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.warn('[@trident/ui] <Lazy3D> scene failed to load; keeping the poster.', err)
        setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [mount, loaded])

  const onFallback = useCallback((_reason: FallbackReason) => setFailed(true), [])

  const state: Lazy3DState = failed
    ? 'failed'
    : refused
      ? 'refused'
      : webgl === false
        ? 'unsupported'
        : mount
          ? loaded
            ? 'live'
            : 'loading'
          : 'poster'

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  const classes = ['ui-lazy3d', className].filter(Boolean).join(' ')
  const showCanvas = mount && loaded !== null
  const quality = tier === 'high' ? 'high' : 'low'
  const Kit = loaded?.kit
  const Scene = loaded?.Scene

  return (
    <ThemeScopeContext.Provider value={el}>
      <div
        ref={setEl}
        className={classes}
        style={{ aspectRatio: ratioStyle(ratio), ...style }}
        data-state={state}
        data-interactive={interactive ? '' : undefined}
      >
        <div className="ui-lazy3d__poster">{renderPoster(poster)}</div>
        {showCanvas && Kit && Scene ? (
          <div className="ui-lazy3d__stage" aria-hidden="true">
            <Kit.SceneCanvas active={visibleNow} interactive={interactive} idleMs={idleMs} onFallback={onFallback}>
              <Scene kit={Kit} quality={quality} {...(sceneProps as P)} />
            </Kit.SceneCanvas>
          </div>
        ) : null}
        {children}
      </div>
    </ThemeScopeContext.Provider>
  )
}
