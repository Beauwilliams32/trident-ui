/**
 * SSR safety. The server snapshot path is exercised with renderToString here; the "no window at
 * import" guarantee is checked in a real DOM-less Node process against the built dist/three.js
 * (skipped only when dist/ has not been built yet; the gate builds before testing).
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { loadGeneratedColors } from '../colors'
import { Lazy3D } from '../Lazy3D'
import { StatusOrbit } from '../StatusOrbit'
import { useTokenColor } from '../useTokenColor'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const DIST = join(ROOT, 'dist', 'three.js')

describe('@trident/ui/three server render', () => {
  it('renders the poster as the final SSR state (no canvas, fixed ratio)', () => {
    const html = renderToString(<Lazy3D scene={async () => ({ default: () => null })} poster="/poster.webp" />)
    expect(html).toContain('class="ui-lazy3d"')
    expect(html).toContain('data-state="poster"')
    expect(html).toContain('src="/poster.webp"')
    expect(html).toContain('aspect-ratio:16 / 9')
    expect(html).not.toContain('<canvas')
    expect(html).not.toContain('ui-lazy3d__stage')
  })

  it('server-renders the StatusOrbit DOM list', () => {
    const html = renderToString(<StatusOrbit poster={{}} items={[{ id: 'instagram', label: 'Instagram', live: true }]} />)
    expect(html).toContain('Instagram: Publishing')
    expect(html).toContain('TikTok: Status not confirmed')
    expect(html).toContain('ui-visually-hidden')
  })

  it('colour hooks render generated fallbacks on the server', async () => {
    await loadGeneratedColors()
    function Swatch() {
      return <i data-c={useTokenColor('accent-1', { theme: 'wmh-portal' }).toString(16)} />
    }
    expect(renderToString(<Swatch />)).toContain('data-c="7c3aed"')
  })

  it.skipIf(!existsSync(DIST))('dist/three.js imports and server-renders in Node with no window or document', () => {
    const script = `
      import { createElement as h } from 'react'
      import { renderToString } from 'react-dom/server'
      const m = await import(${JSON.stringify(pathToFileURL(DIST).href)})
      const html = renderToString(h(m.StatusOrbit, { poster: '/p.webp' }))
      console.log(JSON.stringify({ win: typeof window, doc: typeof document, tier: m.readQualityTier(), webgl: m.hasWebGL2(), html }))
    `
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: ROOT, encoding: 'utf8' })
    const r = JSON.parse(out.trim().split('\n').pop() as string)
    expect(r.win).toBe('undefined')
    expect(r.doc).toBe('undefined')
    expect(r.tier).toBe('off')
    expect(r.webgl).toBe(false)
    expect(r.html).toContain('data-state="poster"')
    expect(r.html).not.toContain('<canvas')
  })
})
