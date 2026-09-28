/**
 * Budgets and SSR safety for the server/islands entries, checked against real bundles.
 * - hydrateIslands() is about 2KB gz (spec §1): minified, React external, ≤ 2048 bytes gzipped.
 * - Both entries import and render in plain Node with no DOM globals (no `window` at import).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '../..')
const OUT = join(ROOT, 'node_modules', '.cache', 'trident-ui-server-islands')

// esbuild refuses to run inside the jsdom environment (its TextEncoder invariant), so the bundles
// are built in a child Node process. esbuild comes with tsup, already a devDependency.
const BUILD = `
  import { build } from 'esbuild'
  const common = { bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', jsx: 'automatic',
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'], logLevel: 'error' }
  await build({ ...common, entryPoints: ['src/islands/index.ts'], outfile: '${OUT}/islands.min.mjs', minify: true })
  await build({ ...common, entryPoints: ['src/islands/index.ts'], outfile: '${OUT}/islands.mjs' })
  await build({ ...common, entryPoints: ['src/server/index.ts'], outfile: '${OUT}/server.mjs' })
`
const read = (file: string) => readFileSync(join(OUT, file), 'utf8')

beforeAll(() => {
  mkdirSync(OUT, { recursive: true })
  execFileSync(process.execPath, ['--input-type=module', '-e', BUILD], { cwd: ROOT, stdio: 'pipe' })
})

describe('islands budget', () => {
  it('hydrateIslands() is ≤ 2KB gzipped (minified, React external)', () => {
    const gz = gzipSync(read('islands.min.mjs'), { level: 9 }).length
    expect(gz, `islands entry is ${gz} B gz`).toBeLessThanOrEqual(2048)
  })

  it('the islands entry never imports server code', () => {
    expect(read('islands.mjs')).not.toMatch(/react-dom\/server|renderToString|SeoHead/)
  })
})

describe('SSR safety in plain Node (no DOM globals)', () => {
  it('server and islands entries import without touching window/document, and renderPage works', () => {
    const script = `
      if (typeof window !== 'undefined' || typeof document !== 'undefined') throw new Error('DOM globals present')
      const { createElement: h } = await import('react')
      const server = await import('./server.mjs')
      const islands = await import('./islands.mjs')
      if (typeof islands.hydrateIslands !== 'function') throw new Error('no hydrateIslands')
      const empty = islands.hydrateIslands({})
      await empty.ready
      if (empty.roots.length !== 0) throw new Error('hydrated without a DOM')
      const Hello = ({ who }) => h('p', null, 'Hello ', who)
      const html = await server.renderPage({
        theme: 'trident-ops',
        seo: { title: 'Ops', jsonLd: server.organization({ name: 'Trident', url: 'https://trident.dev' }) },
        children: h('main', null, h('h1', null, 'Ops'), h(server.Island, { name: 'Hello', component: Hello, props: { who: 'Node' } })),
      })
      process.stdout.write(html)
    `
    const html = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: OUT, encoding: 'utf8' })
    expect(html).toMatch(/^<!DOCTYPE html><html lang="en" data-theme="trident-ops" data-scheme="dark">/)
    expect(html).toContain('<p>Hello <!-- -->Node</p>')
    expect(html).toContain('application/ld+json')
  })
})
