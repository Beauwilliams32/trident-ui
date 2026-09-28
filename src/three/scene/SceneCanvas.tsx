import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, type RootState } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import { isBrowser, isCoarsePointer, isMotionPaused } from '../env'
import { FpsGuard } from '../fpsGuard'
import type { FallbackReason, SceneCanvasProps } from '../types'
import { reportPerformanceDecline } from '../useQualityTier'

/** Renderer settings from spec §6.5. Exported so tests can pin them. */
export const GL_OPTIONS = Object.freeze({ antialias: false, powerPreference: 'low-power', alpha: true } as const)
export const DPR_RANGE: [number, number] = [1, 1.5]
export const IDLE_MS = 8000

export type Frameloop = 'always' | 'demand' | 'never'

/** The frameloop rule: never when off-screen/hidden or paused, demand once idle, else always. */
export function frameloopFor(active: boolean, paused: boolean, idle: boolean): Frameloop {
  if (!active || paused) return 'never'
  return idle ? 'demand' : 'always'
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }
  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    console.warn('[@trident/ui] 3D scene crashed; falling back to the poster.', error)
    this.props.onError()
  }
  override render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}

function usePaused(): boolean {
  const [paused, setPaused] = useState(isMotionPaused)
  useEffect(() => {
    if (!isBrowser() || typeof MutationObserver !== 'function') return
    const mo = new MutationObserver(() => setPaused(isMotionPaused()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    return () => mo.disconnect()
  }, [])
  return paused
}

/** Continuous frames for `ms` after mount or the last pointer/scroll input, then idle. */
function useIdle(ms: number): boolean {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (!isBrowser()) return
    let timer = setTimeout(() => setIdle(true), ms)
    const wake = () => {
      clearTimeout(timer)
      setIdle(false)
      timer = setTimeout(() => setIdle(true), ms)
    }
    window.addEventListener('pointermove', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('scroll', wake)
    }
  }, [ms])
  return idle
}

/** Mounts the scene graph in an idle callback, so building it is not one long task on mount. */
function IdleMount({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(t)
  }, [])
  return ready ? <>{children}</> : null
}

/** Watches frame deltas once armed; below 40fps for 3s swaps to the poster. */
function FrameRateGuard({ armed, onTrip }: { armed: boolean; onTrip: () => void }) {
  const guard = useRef(new FpsGuard())
  useEffect(() => {
    guard.current.reset()
  }, [armed])
  useFrame((_state, delta) => {
    if (armed && guard.current.push(delta)) onTrip()
  })
  return null
}

/**
 * The R3F canvas every scene renders into (spec §6.5). Only `<Lazy3D>` mounts it.
 * dpr [1, 1.5] (1 on coarse pointers); antialias off, low-power, alpha. frameloop 'never' when
 * off-screen, hidden or paused, 'demand' after 8s idle. PerformanceMonitor steps dpr down, then
 * particles (the page-wide quality tier drops to 'low'), then swaps to the poster below 40fps for
 * 3s. Context loss and render errors fall back to the poster. Disposes the renderer on unmount.
 */
export function SceneCanvas({ children, active = true, interactive = false, idleMs = IDLE_MS, onFallback, camera, className }: SceneCanvasProps) {
  const paused = usePaused()
  const idle = useIdle(idleMs)
  const frameloop = frameloopFor(active, paused, idle)
  const coarse = isCoarsePointer()
  const [step, setStep] = useState(0)
  const glRef = useRef<RootState['gl'] | null>(null)
  const fellBack = useRef(false)

  const fallback = useCallback(
    (reason: FallbackReason) => {
      if (fellBack.current) return
      fellBack.current = true
      onFallback?.(reason)
    },
    [onFallback],
  )

  const onContextLost = useCallback(
    (e: Event) => {
      e.preventDefault()
      fallback('context-lost')
    },
    [fallback],
  )

  const onCreated = useCallback(
    ({ gl }: RootState) => {
      glRef.current = gl
      const canvas = gl.domElement
      canvas.setAttribute('aria-hidden', 'true')
      canvas.tabIndex = -1
      canvas.addEventListener('webglcontextlost', onContextLost, false)
    },
    [onContextLost],
  )

  useEffect(
    () => () => {
      const gl = glRef.current
      glRef.current = null
      if (!gl) return
      gl.domElement.removeEventListener('webglcontextlost', onContextLost, false)
      try {
        gl.dispose()
        gl.forceContextLoss()
      } catch {
        /* already gone */
      }
    },
    [onContextLost],
  )

  const onDecline = useCallback(() => {
    setStep((s) => Math.min(s + 1, 2))
  }, [])

  useEffect(() => {
    if (step >= 2) reportPerformanceDecline()
  }, [step])

  const dpr: number | [number, number] = coarse || step >= 1 ? 1 : DPR_RANGE

  return (
    <SceneErrorBoundary onError={() => fallback('error')}>
      <Canvas
        className={className}
        dpr={dpr}
        gl={{ ...GL_OPTIONS }}
        frameloop={frameloop}
        camera={{ fov: camera?.fov ?? 30, position: camera?.position ?? [0, 0, 9.4], near: 0.5, far: 40 }}
        onCreated={onCreated}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: interactive ? 'auto' : 'none' }}
      >
        <PerformanceMonitor bounds={() => [40, 58]} flipflops={3} onDecline={onDecline}>
          <FrameRateGuard armed={step >= 2 && frameloop === 'always'} onTrip={() => fallback('performance')} />
          <IdleMount>{children}</IdleMount>
        </PerformanceMonitor>
      </Canvas>
    </SceneErrorBoundary>
  )
}
