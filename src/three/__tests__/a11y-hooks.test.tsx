/** vitest-axe, theme × scheme smoke, the gallery stories, and the quality/colour hooks. */
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadGeneratedColors } from '../colors'
import { Lazy3D } from '../Lazy3D'
import { PosterFallback } from '../PosterFallback'
import { StatusOrbit, StatusOrbitList } from '../StatusOrbit'
import { examples, group } from '../three.gallery'
import type { SceneLoader } from '../types'
import { reportPerformanceDecline, useQualityTier } from '../useQualityTier'
import { ThemeScopeContext, useBrandColors, useTokenColor } from '../useTokenColor'
import { stubEnv } from './helpers'
import { generatedColors } from '../generated'

const scene: SceneLoader = async () => ({ default: () => null })

const THEMES: Array<[string, 'dark' | 'light']> = [
  ['trident-studio', 'dark'],
  ['wmh-portal', 'light'],
  ['wmh-marketing', 'dark'],
  ['portfolio', 'dark'],
  ['quorum', 'dark'],
]

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-motion')
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('style')
})

describe('accessibility (spec §9)', () => {
  it('Lazy3D with its poster has no axe violations', async () => {
    stubEnv({ reduce: true })
    const { container } = render(
      <main>
        <h1>Studio</h1>
        <Lazy3D scene={scene} poster={{ src: '/p.webp', width: 1600, height: 900 }}>
          <p>Decorative orbit.</p>
        </Lazy3D>
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
  })

  it('StatusOrbit renders a visually hidden list with text for every state', async () => {
    stubEnv({ reduce: true })
    const { container } = render(
      <main>
        <h1>Portal</h1>
        <StatusOrbit poster={{}} items={[{ id: 'instagram', label: 'Instagram', live: true }]} />
      </main>,
    )
    const list = screen.getByRole('list', { name: 'Publishing status by platform' })
    expect(list.classList.contains('ui-visually-hidden')).toBe(true)
    expect(screen.getByText('Instagram: Publishing')).toBeTruthy()
    expect(screen.getByText('TikTok: Status not confirmed')).toBeTruthy()
    expect(list.querySelectorAll('li')).toHaveLength(10)
    expect(list.querySelectorAll('li[data-state="live"]')).toHaveLength(1)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the fallback StatusOrbit list lights nothing', () => {
    render(<StatusOrbitList />)
    expect(document.querySelectorAll('li[data-state="live"]')).toHaveLength(0)
  })

  it.each(THEMES)('theme %s × %s scheme smoke passes axe', async (theme, scheme) => {
    stubEnv({ reduce: true })
    const { container } = render(
      <div data-theme={theme} data-scheme={scheme}>
        <main>
          <h1>Theme smoke</h1>
          <StatusOrbit poster={{}} />
          <PosterFallback src="/p.webp" alt="" />
        </main>
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('gallery stories', () => {
  it('exports examples for the three group', () => {
    expect(group).toBe('three')
    expect(examples.length).toBeGreaterThanOrEqual(5)
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length)
  })

  it.each(examples.map((e) => [e.id, e] as const))('%s renders (poster only under reduced motion) and passes axe', async (_id, ex) => {
    const env = stubEnv({ reduce: true })
    const { container } = render(
      <main>
        <h1>{ex.title}</h1>
        {ex.render()}
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
    expect(env.getContext.mock.calls.filter(([t]) => /webgl/i.test(String(t)))).toHaveLength(0)
  })
})

describe('useQualityTier', () => {
  it('is off under reduced motion', () => {
    stubEnv({ reduce: true })
    expect(renderHook(() => useQualityTier()).result.current).toBe('off')
  })

  it('follows Pause motion live', async () => {
    stubEnv()
    const { result } = renderHook(() => useQualityTier())
    expect(result.current).toBe('high')
    act(() => document.documentElement.setAttribute('data-motion', 'paused'))
    await waitFor(() => expect(result.current).toBe('off'))
    act(() => document.documentElement.removeAttribute('data-motion'))
    await waitFor(() => expect(result.current).toBe('high'))
  })

  it('follows a reduced-motion change live', () => {
    const env = stubEnv()
    const { result } = renderHook(() => useQualityTier())
    act(() => env.setReduce(true))
    expect(result.current).toBe('off')
  })

  it('drops to low on coarse pointers and after a performance step-down', () => {
    const env = stubEnv()
    const { result } = renderHook(() => useQualityTier())
    act(() => env.setCoarse(true))
    expect(result.current).toBe('low')
    act(() => env.setCoarse(false))
    expect(result.current).toBe('high')
    act(() => reportPerformanceDecline())
    expect(result.current).toBe('low')
  })
})

describe('useTokenColor / useBrandColors', () => {
  it('fall back to the generated three.mjs values for the active theme', async () => {
    await loadGeneratedColors()
    document.documentElement.setAttribute('data-theme', 'wmh-portal')
    const { result } = renderHook(() => ({ accent: useTokenColor('accent-1'), all: useBrandColors() }))
    expect(result.current.accent).toBe(generatedColors('wmh-portal')['accent-1'])
    expect(result.current.all['accent-2']).toBe(generatedColors('wmh-portal')['accent-2'])
  })

  it('prefer the runtime CSS custom property (tenant accents via ensureContrast)', async () => {
    await loadGeneratedColors()
    document.documentElement.setAttribute('data-theme', 'trident-ops')
    document.documentElement.style.setProperty('--ui-accent-1', '#123456')
    const { result } = renderHook(() => ({ accent: useTokenColor('accent-1'), all: useBrandColors() }))
    expect(result.current.accent).toBe(0x123456)
    expect(result.current.all['accent-1']).toBe(0x123456)
    expect(result.current.all['accent-2']).toBe(generatedColors('trident-ops')['accent-2'])
  })

  it('read the theme of the Lazy3D scope element', async () => {
    await loadGeneratedColors()
    const scope = document.createElement('div')
    scope.setAttribute('data-theme', 'portfolio')
    document.body.appendChild(scope)
    const { result } = renderHook(() => useTokenColor('accent-1'), {
      wrapper: ({ children }) => <ThemeScopeContext.Provider value={scope}>{children}</ThemeScopeContext.Provider>,
    })
    expect(result.current).toBe(generatedColors('portfolio')['accent-1'])
    scope.remove()
  })

  it('honour an explicit theme option', async () => {
    await loadGeneratedColors()
    const { result } = renderHook(() => useTokenColor('accent-1', { theme: 'quorum' }))
    expect(result.current).toBe(generatedColors('quorum')['accent-1'])
  })
})
