/** Spec §6.4/§6.5/§6.8: the Lazy3D gates, with the R3F kit mocked (no real WebGL in jsdom). */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Lazy3D } from '../Lazy3D'
import type { FallbackReason, SceneLoader, SceneProps } from '../types'
import { stubEnv, webglCalls } from './helpers'

const canvasSpy = vi.hoisted(() => ({ onFallback: null as null | ((r: FallbackReason) => void), renders: 0 }))

vi.mock('../scene/index', () => {
  function SceneCanvas({ children, active, onFallback }: { children?: ReactNode; active?: boolean; onFallback?: (r: FallbackReason) => void }) {
    canvasSpy.onFallback = onFallback ?? null
    canvasSpy.renders++
    return (
      <div data-testid="scene-canvas" data-active={String(active)}>
        {children}
      </div>
    )
  }
  const none = () => null
  return { sceneKit: { SceneCanvas, FresnelCore: none, OrbitRing: none, StatusOrbitCards: none, StatusOrbitScene: none } }
})

function Scene({ quality }: SceneProps) {
  return <div data-testid="scene" data-quality={quality} />
}

function makeLoader() {
  return vi.fn<SceneLoader>(async () => ({ default: Scene }))
}

const flush = () => act(() => new Promise<void>((r) => setTimeout(r, 20)))

describe('<Lazy3D>', () => {
  beforeEach(() => {
    canvasSpy.onFallback = null
    canvasSpy.renders = 0
  })
  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.removeAttribute('data-motion')
  })

  it('mounts the scene once every gate passes, with the poster painted first', async () => {
    stubEnv()
    const scene = makeLoader()
    const { container } = render(<Lazy3D scene={scene} poster="/poster.webp" />)
    const slot = container.querySelector('.ui-lazy3d') as HTMLElement
    expect(slot.querySelector('img')?.getAttribute('src')).toBe('/poster.webp')
    await waitFor(() => expect(screen.getByTestId('scene')).toBeTruthy())
    expect(scene).toHaveBeenCalledTimes(1)
    expect(slot.dataset.state).toBe('live')
    expect(slot.querySelector('img')).toBeTruthy() // poster stays underneath
    const stage = slot.querySelector('.ui-lazy3d__stage') as HTMLElement
    expect(stage.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByTestId('scene').dataset.quality).toBe('high')
  })

  it('keeps a fixed aspect ratio so the slot never shifts layout', () => {
    stubEnv()
    const { container } = render(<Lazy3D scene={makeLoader()} poster="/p.webp" ratio="4 / 3" />)
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('4 / 3')
    const { container: c2 } = render(<Lazy3D scene={makeLoader()} poster="/p.webp" />)
    expect((c2.firstElementChild as HTMLElement).style.aspectRatio).toBe('16 / 9')
  })

  it('reduced motion never creates a WebGL context and never loads the scene', async () => {
    const env = stubEnv({ reduce: true })
    const scene = makeLoader()
    const { container } = render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(webglCalls(env.getContext)).toHaveLength(0)
    expect(scene).not.toHaveBeenCalled()
    expect(screen.queryByTestId('scene-canvas')).toBeNull()
    expect((container.firstElementChild as HTMLElement).dataset.state).toBe('poster')
  })

  it('Pause motion (html[data-motion=paused]) never creates a WebGL context', async () => {
    const env = stubEnv()
    document.documentElement.setAttribute('data-motion', 'paused')
    const scene = makeLoader()
    render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(webglCalls(env.getContext)).toHaveLength(0)
    expect(scene).not.toHaveBeenCalled()
  })

  it('lowPower devices never create a WebGL context', async () => {
    const env = stubEnv({ cores: 2 })
    const scene = makeLoader()
    render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(webglCalls(env.getContext)).toHaveLength(0)
    expect(scene).not.toHaveBeenCalled()
  })

  it('unmounts the canvas when reduced motion turns on after mount', async () => {
    const env = stubEnv()
    render(<Lazy3D scene={makeLoader()} poster="/poster.webp" />)
    await waitFor(() => expect(screen.getByTestId('scene')).toBeTruthy())
    act(() => env.setReduce(true))
    await waitFor(() => expect(screen.queryByTestId('scene-canvas')).toBeNull())
  })

  it.each(['money', 'auth', 'legal', 'admin'])('refuses to mount under [data-surface=%s]', async (surface) => {
    const env = stubEnv()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const scene = makeLoader()
    const { container } = render(
      <section data-surface={surface}>
        <div>
          <Lazy3D scene={scene} poster="/poster.webp" />
        </div>
      </section>,
    )
    await flush()
    await flush()
    expect((container.querySelector('.ui-lazy3d') as HTMLElement).dataset.state).toBe('refused')
    expect(scene).not.toHaveBeenCalled()
    expect(webglCalls(env.getContext)).toHaveLength(0)
    expect(warn).toHaveBeenCalled()
  })

  it('mounts under an allowed surface such as marketing', async () => {
    stubEnv()
    render(
      <div data-surface="marketing">
        <Lazy3D scene={makeLoader()} poster="/poster.webp" />
      </div>,
    )
    await waitFor(() => expect(screen.getByTestId('scene')).toBeTruthy())
  })

  it('does not mount below minWidth (poster only)', async () => {
    const env = stubEnv({ width: 900 })
    const scene = makeLoader()
    render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(scene).not.toHaveBeenCalled()
    expect(webglCalls(env.getContext)).toHaveLength(0)
  })

  it('small scenes may pass minWidth 768 and then run at the low tier', async () => {
    stubEnv({ width: 900 })
    render(<Lazy3D scene={makeLoader()} poster="/poster.webp" minWidth={768} />)
    await waitFor(() => expect(screen.getByTestId('scene').dataset.quality).toBe('low'))
  })

  it('does not mount while the slot is off-screen', async () => {
    stubEnv({ intersecting: false })
    const scene = makeLoader()
    render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(scene).not.toHaveBeenCalled()
  })

  it('does not mount without WebGL2', async () => {
    stubEnv({ webgl2: false })
    const scene = makeLoader()
    const { container } = render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await flush()
    await flush()
    expect(scene).not.toHaveBeenCalled()
    expect((container.firstElementChild as HTMLElement).dataset.state).toBe('unsupported')
  })

  it('does not mount while a form field has focus, and unmounts when one gains focus', async () => {
    stubEnv()
    const scene = makeLoader()
    render(
      <div>
        <label>
          Email <input type="email" />
        </label>
        <Lazy3D scene={scene} poster="/poster.webp" />
      </div>,
    )
    const input = screen.getByLabelText('Email')
    await waitFor(() => expect(screen.getByTestId('scene')).toBeTruthy())
    act(() => {
      input.focus()
      fireEvent.focusIn(input)
    })
    await waitFor(() => expect(screen.queryByTestId('scene-canvas')).toBeNull())
  })

  it('falls back to the poster for good on context loss', async () => {
    stubEnv()
    const { container } = render(<Lazy3D scene={makeLoader()} poster="/poster.webp" />)
    await waitFor(() => expect(canvasSpy.onFallback).toBeTypeOf('function'))
    act(() => canvasSpy.onFallback?.('context-lost'))
    await waitFor(() => expect(screen.queryByTestId('scene-canvas')).toBeNull())
    expect((container.firstElementChild as HTMLElement).dataset.state).toBe('failed')
    expect(container.querySelector('img')).toBeTruthy()
  })

  it('keeps the poster when the scene module fails to load', async () => {
    stubEnv()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const scene = vi.fn<SceneLoader>(async () => {
      throw new Error('chunk 404')
    })
    const { container } = render(<Lazy3D scene={scene} poster="/poster.webp" />)
    await waitFor(() => expect((container.firstElementChild as HTMLElement).dataset.state).toBe('failed'))
  })

  it('renders DOM children (the scene’s text equivalents) whether or not 3D mounts', async () => {
    stubEnv({ reduce: true })
    render(
      <Lazy3D scene={makeLoader()} poster="/poster.webp">
        <p>Orbit of eight platforms</p>
      </Lazy3D>,
    )
    expect(screen.getByText('Orbit of eight platforms')).toBeTruthy()
  })

  it('accepts PosterFallback props or custom poster markup', () => {
    stubEnv({ reduce: true })
    const { container } = render(<Lazy3D scene={makeLoader()} poster={{ src: '/a.webp', avif: '/a.avif', width: 1600, height: 900 }} />)
    expect(container.querySelector('source[type="image/avif"]')?.getAttribute('srcset')).toBe('/a.avif')
    const { container: c2 } = render(<Lazy3D scene={makeLoader()} poster={<svg data-testid="svg-poster" />} />)
    expect(c2.querySelector('[data-testid="svg-poster"]')).toBeTruthy()
  })

  it('reports state changes', async () => {
    stubEnv()
    const states: string[] = []
    render(<Lazy3D scene={makeLoader()} poster="/p.webp" onStateChange={(s) => states.push(s)} />)
    await waitFor(() => expect(states).toContain('live'))
    expect(states[0]).toBe('poster')
  })
})
