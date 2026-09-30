/**
 * Spec §1, §6.5, §9: the root entry (`@trident/ui`) never imports three or @react-three/*, directly
 * or through any module it reaches; 3D lives only in the `@trident/ui/three` subpath and its lazy
 * chunk. Checked on the source graph (always) and on the built dist/ graph (when dist/ exists).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const THREE = /^(three|@react-three\/[^/]+)(\/.*)?$/
const SUBPATH_ONLY = /^src\/(three|motion|motion-lite|app|server|islands)\//

// esbuild refuses to run inside jsdom (TextEncoder realm check), so bundle in a child process.
const GRAPH = `
  import { build } from 'esbuild'
  const r = await build({ entryPoints: ['src/index.ts'], bundle: true, write: false, metafile: true,
    format: 'esm', platform: 'browser', jsx: 'automatic', packages: 'external', logLevel: 'error' })
  const ext = new Set()
  for (const input of Object.values(r.metafile.inputs)) for (const i of input.imports) if (i.external) ext.add(i.path)
  process.stdout.write(JSON.stringify({ inputs: Object.keys(r.metafile.inputs), external: [...ext] }))
`

describe('root entry isolation', () => {
  it('the source graph of src/index.ts never reaches three, @react-three/* or a subpath-only group', () => {
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', GRAPH], { cwd: ROOT, encoding: 'utf8' })
    const { inputs, external } = JSON.parse(out) as { inputs: string[]; external: string[] }
    expect(inputs.length).toBeGreaterThan(20)
    expect(external.filter((p) => THREE.test(p))).toEqual([])
    expect(inputs.filter((p) => SUBPATH_ONLY.test(p))).toEqual([])
  })

  it.skipIf(!existsSync(join(ROOT, 'dist/index.js')))('the built dist/index.js static and dynamic graph never imports three or @react-three/*', () => {
    const seen = new Set<string>()
    const bare = new Set<string>()
    const walk = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      const code = readFileSync(file, 'utf8')
      for (const m of code.matchAll(/(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = m[1] ?? m[2]!
        if (spec.startsWith('.')) walk(resolve(dirname(file), spec))
        else bare.add(spec)
      }
    }
    walk(join(ROOT, 'dist/index.js'))
    expect([...bare].filter((p) => THREE.test(p))).toEqual([])
    expect([...seen].map((f) => relative(ROOT, f)).filter((f) => /chunks\/scene-/.test(f))).toEqual([])
  })
})
