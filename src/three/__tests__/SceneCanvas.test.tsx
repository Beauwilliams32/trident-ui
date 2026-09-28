/** Spec §6.5 SceneCanvas contract, with @react-three/fiber and drei mocked. */
import { act, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readQualityTier } from '../useQualityTier'
import { stubEnv } from './helpers'

const r3f = vi.hoisted(() => ({
  last: null as null | Record<string, unknown>,
  frameCallbacks: [] as Array<(state: unknown, delta: number) => void>,
  gl: null as null | { domElement: HTMLCanvasElement; dispose: ReturnType<typeof vi.fn>; forceContextLoss: ReturnType<typeof vi.fn> },
  decline: null as null | (() => void),
}))

vi.mock('@react-three/fiber', async () => {
  const React = await import('react')
  function Canvas(props: Record<string, unknown> & { children?: ReactNode; onCreated?: (s: unknown) => void }) {
    r3f.last = props
    const { onCreated } = props
    React.useEffect(() => {
      const domElement = document.createElement('canvas')
      r3f.gl = { domElement, dispose: vi.fn(), forceContextLoss: vi.fn() }
      onCreated?.({ gl: r3f.gl })
      // mount once, like R3F's root
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return React.createElement('div', { 'data-testid': 'r3f-canvas', 'data-frameloop': String(props.frameloop) }, props.children)
  }
  function useFrame(cb: (state: unknown, delta: number) => void) {
    r3f.frameCallbacks.push(cb)
  }
  return { Canvas, useFrame }
})

vi.mock('@react-three/drei', () => ({
  PerformanceMonitor({ children, onDecline }: { children?: ReactNode; onDecline?: () => void }) {
    r3f.decline = onDecline ?? null
    return <>{children}</>
  },
}))

const { SceneCanvas, GL_OPTIONS, DPR_RANGE, frameloopFor } = await import('../scene/SceneCanvas')

function Probe() {
  return <span data-testid="scene-child" />
}

function Thrower(): ReactNode {
  throw new Error('shader exploded')
}

describe('<SceneCanvas>', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    r3f.last = null
    r3f.gl = null
    r3f.frameCallbacks = []
    document.documentElement.removeAttribute('data-motion')
  })

  it('uses dpr [1, 1.5], antialias off, low-power and alpha', () => {
    stubEnv()
    render(<SceneCanvas />)
    expect(r3f.last?.dpr).toEqual([1, 1.5])
    expect(DPR_RANGE).toEqual([1, 1.5])
    expect(r3f.last?.gl).toEqual({ antialias: false, powerPreference: 'low-power', alpha: true })
    expect(GL_OPTIONS).toEqual({ antialias: false, powerPreference: 'low-power', alpha: true })
  })

  it('uses dpr 1 on coarse pointers', () => {
    stubEnv({ coarse: true })
    render(<SceneCanvas />)
    expect(r3f.last?.dpr).toBe(1)
  })

  it('makes the canvas aria-hidden, tabIndex -1 and pointer-events none unless interactive', () => {
    stubEnv()
    const { unmount } = render(<SceneCanvas />)
    expect(r3f.gl?.domElement.getAttribute('aria-hidden')).toBe('true')
    expect(r3f.gl?.domElement.tabIndex).toBe(-1)
    expect((r3f.last?.style as { pointerEvents: string }).pointerEvents).toBe('none')
    unmount()
    render(<SceneCanvas interactive />)
    expect((r3f.last?.style as { pointerEvents: string }).pointerEvents).toBe('auto')
  })

  it('frameloop: never off-screen or paused, demand when idle, always otherwise', () => {
    expect(frameloopFor(false, false, false)).toBe('never')
    expect(frameloopFor(true, true, false)).toBe('never')
    expect(frameloopFor(true, false, true)).toBe('demand')
    expect(frameloopFor(true, false, false)).toBe('always')
  })

  it('stops the frameloop when off-screen', () => {
    stubEnv()
    render(<SceneCanvas active={false} />)
    expect(r3f.last?.frameloop).toBe('never')
  })

  it('stops the frameloop on Pause', async () => {
    stubEnv()
    render(<SceneCanvas />)
    expect(r3f.last?.frameloop).toBe('always')
    act(() => document.documentElement.setAttribute('data-motion', 'paused'))
    await waitFor(() => expect(r3f.last?.frameloop).toBe('never'))
  })

  it('switches to an on-demand loop after 8s idle and wakes on pointer input', () => {
    vi.useFakeTimers()
    stubEnv()
    render(<SceneCanvas />)
    expect(r3f.last?.frameloop).toBe('always')
    act(() => vi.advanceTimersByTime(7999))
    expect(r3f.last?.frameloop).toBe('always')
    act(() => vi.advanceTimersByTime(2))
    expect(r3f.last?.frameloop).toBe('demand')
    act(() => {
      window.dispatchEvent(new Event('pointermove'))
    })
    expect(r3f.last?.frameloop).toBe('always')
  })

  it('builds the scene in an idle callback', async () => {
    stubEnv()
    render(
      <SceneCanvas>
        <Probe />
      </SceneCanvas>,
    )
    expect(screen.queryByTestId('scene-child')).toBeNull()
    await waitFor(() => expect(screen.getByTestId('scene-child')).toBeTruthy())
  })

  it('falls back to the poster once on webglcontextlost', () => {
    stubEnv()
    const onFallback = vi.fn()
    render(<SceneCanvas onFallback={onFallback} />)
    const ev = new Event('webglcontextlost', { cancelable: true })
    r3f.gl?.domElement.dispatchEvent(ev)
    r3f.gl?.domElement.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    expect(ev.defaultPrevented).toBe(true)
    expect(onFallback).toHaveBeenCalledTimes(1)
    expect(onFallback).toHaveBeenCalledWith('context-lost')
  })

  it('an ErrorBoundary turns a scene crash into a poster fallback', async () => {
    stubEnv()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onFallback = vi.fn()
    render(
      <SceneCanvas onFallback={onFallback}>
        <Thrower />
      </SceneCanvas>,
    )
    await waitFor(() => expect(onFallback).toHaveBeenCalledWith('error'))
  })

  it('disposes the renderer and releases the context on unmount', () => {
    stubEnv()
    const { unmount } = render(<SceneCanvas />)
    const gl = r3f.gl
    unmount()
    expect(gl?.dispose).toHaveBeenCalled()
    expect(gl?.forceContextLoss).toHaveBeenCalled()
  })

  it('PerformanceMonitor steps down dpr, then particles (tier low), then the poster below 40fps for 3s', async () => {
    stubEnv()
    const onFallback = vi.fn()
    render(<SceneCanvas onFallback={onFallback} />)
    expect(readQualityTier()).toBe('high')
    act(() => r3f.decline?.())
    await waitFor(() => expect(r3f.last?.dpr).toBe(1))
    expect(readQualityTier()).toBe('high')
    act(() => r3f.decline?.())
    await waitFor(() => expect(readQualityTier()).toBe('low'))
    expect(onFallback).not.toHaveBeenCalled()
    // 30fps for 3.5s through every registered frame callback (the guard is the one that trips).
    act(() => {
      for (let i = 0; i < 105; i++) for (const cb of r3f.frameCallbacks) cb({}, 1 / 30)
    })
    expect(onFallback).toHaveBeenCalledWith('performance')
  })

  it('does not swap to the poster at a healthy frame rate', async () => {
    stubEnv()
    const onFallback = vi.fn()
    render(<SceneCanvas onFallback={onFallback} />)
    act(() => {
      r3f.decline?.()
      r3f.decline?.()
    })
    act(() => {
      for (let i = 0; i < 400; i++) for (const cb of r3f.frameCallbacks) cb({}, 1 / 60)
    })
    expect(onFallback).not.toHaveBeenCalled()
  })
})
