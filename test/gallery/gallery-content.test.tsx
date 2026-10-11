/**
 * Gallery content rules (QUALITY-REVIEW.md G2, G3, G4): every component example explains when to
 * use it, ships its own source for the Code disclosure, never shows a bare browser button, and the
 * install snippet can never name a stale tag.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { exampleSources } from '../../gallery/data/sources'
import { ROOT } from '../../scripts/lib/tokens.mjs'

interface Raw {
  id?: string
  title?: string
  name?: string
  component?: string
  description?: string
  render: () => ReactNode
}
type Mod = { examples?: Raw[]; default?: Raw[] | { examples?: Raw[] } }
const examplesOf = (m: Mod): Raw[] => (Array.isArray(m.examples) ? m.examples : Array.isArray(m.default) ? m.default : (m.default?.examples ?? []))

const modules = import.meta.glob<Mod>('../../src/*/*.gallery.tsx', { eager: true })
const files = Object.keys(modules).map((k) => ({ key: k, file: join(import.meta.dirname, k), group: k.split('/').at(-2)! }))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

describe('gallery examples', () => {
  it('cover every component group', () => {
    expect(files.map((f) => f.group).sort()).toEqual(
      expect.arrayContaining(['a11y', 'actions', 'app', 'display', 'feedback', 'forms', 'islands', 'layout', 'marketing', 'motion', 'motion-lite', 'server', 'three', 'type']),
    )
  })

  it.each(files)('$group: every example has a description of when to use it (G4)', ({ key }) => {
    for (const ex of examplesOf(modules[key]!)) {
      const name = ex.title ?? ex.name ?? ex.id
      expect(ex.description?.trim().length ?? 0, `${key} "${name}" has no description`).toBeGreaterThanOrEqual(20)
    }
  })

  it.each(files)('$group: every example has extractable source for its Code disclosure (G4)', ({ key, file }) => {
    const examples = examplesOf(modules[key]!)
    const sources = exampleSources(file)
    expect(sources, relative(ROOT, file)).toHaveLength(examples.length)
    for (const [i, src] of sources.entries()) expect(src.trim(), `${key} example ${i}`).toMatch(/<[A-Za-z]/)
  })
})

describe('G2: no bare browser buttons in the showcase', () => {
  const RENDERABLE = ['a11y', 'actions', 'app', 'display', 'feedback', 'forms', 'islands', 'layout', 'marketing', 'type']
  it.each(files.filter((f) => RENDERABLE.includes(f.group)))('$group', ({ key }) => {
    for (const ex of examplesOf(modules[key]!)) {
      const { container, unmount } = render(<>{ex.render()}</>)
      const bare = [...container.querySelectorAll('button:not([class])')].map((b) => b.textContent)
      expect(bare, `${key} "${ex.title ?? ex.name}"`).toEqual([])
      unmount()
    }
  })
})

describe('G3: the install snippet', () => {
  const galleryFiles = [
    ...files.map((f) => f.file),
    ...readdirSync(join(ROOT, 'gallery/docs'))
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => join(ROOT, 'gallery/docs', f)),
  ]

  it('no gallery file pins the uninstallable #v0.1.0 tag', () => {
    for (const f of galleryFiles) expect(readFileSync(f, 'utf8'), relative(ROOT, f)).not.toContain('#v0.1.0')
  })

  it('names the package.json version', () => {
    const type = examplesOf(modules['../../src/type/type.gallery.tsx']!).find((e) => e.id === 'mono-code-kbd')!
    const { container } = render(<>{type.render()}</>)
    expect(container.querySelector('.ui-code-block')!.textContent).toBe(`npm install github:Beauwilliams32/trident-ui#v${pkg.version}`)
  })
})
