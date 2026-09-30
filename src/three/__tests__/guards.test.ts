/**
 * Static guards for @trident/ui/three (spec §6.5):
 * - drei is imported only by name from the allow-list;
 * - the banned list (Draco/KTX2/meshopt decoders, drei <Text>/troika, MeshTransmissionMaterial,
 *   HDRI/remote environments, postprocessing) never appears;
 * - no remote asset URLs (procedural or owned, same-origin only);
 * - the light entry's static import graph never reaches three, R3F or drei.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const DREI_ALLOW = ['PerformanceMonitor', 'AdaptiveDpr', 'Instances', 'Instance', 'Merged', 'Float', 'RoundedBox', 'useTexture'] as const

const BANNED_MODULES = [
  /DRACOLoader/i,
  /KTX2Loader/i,
  /meshopt/i,
  /troika/i,
  /basis_transcoder/i,
  /draco_decoder/i,
  /(^|\/)postprocessing$/,
  /@react-three\/postprocessing/,
  /RGBELoader|EXRLoader|HDRLoader|HDRCubeTextureLoader/,
]
const BANNED_IDENTIFIERS = ['MeshTransmissionMaterial', 'Environment', 'useEnvironment', 'Text', 'Text3D', 'Lightformer', 'EffectComposer', 'Bloom', 'useGLTF', 'Gltf']

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name !== '__tests__') sourceFiles(p, out)
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p)
  }
  return out
}

interface ImportDecl {
  file: string
  specifier: string
  names: string[]
  typeOnly: boolean
  dynamic: boolean
  namespace: boolean
  defaultName: boolean
}

function imports(file: string): ImportDecl[] {
  const src = readFileSync(file, 'utf8')
  const out: ImportDecl[] = []
  const re = /(import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const clause = m[3] ?? ''
    const named = /\{([\s\S]*)\}/.exec(clause)?.[1] ?? ''
    const names = named
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^type\s+/, '').split(/\s+as\s+/)[0] as string)
    const typeOnly = !!m[2] || (named !== '' && named.split(',').every((s) => !s.trim() || /^type\s/.test(s.trim())) && !/^[A-Za-z_$]/.test(clause.replace(/\{[\s\S]*\}/, '').trim()))
    out.push({
      file,
      specifier: m[4] as string,
      names,
      typeOnly,
      dynamic: false,
      namespace: /\*\s+as\s+/.test(clause),
      defaultName: /^[A-Za-z_$][\w$]*\s*(,|$)/.test(clause.trim()),
    })
  }
  const bare = /import\s+['"]([^'"]+)['"]/g
  for (let m = bare.exec(src); m; m = bare.exec(src)) out.push({ file, specifier: m[1] as string, names: [], typeOnly: false, dynamic: false, namespace: false, defaultName: false })
  const dyn = /import\(\s*['"]([^'"]+)['"]\s*\)/g
  for (let m = dyn.exec(src); m; m = dyn.exec(src)) out.push({ file, specifier: m[1] as string, names: [], typeOnly: false, dynamic: true, namespace: false, defaultName: false })
  return out
}

const files = sourceFiles(DIR)
const all = files.flatMap(imports)

describe('drei allow-list and banned list (spec §6.5)', () => {
  it('finds the source files', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it('imports drei only by name, only from the package root, only allow-listed names', () => {
    const drei = all.filter((i) => i.specifier.startsWith('@react-three/drei'))
    expect(drei.length).toBeGreaterThan(0)
    for (const i of drei) {
      const where = relative(DIR, i.file)
      expect(i.specifier, `${where}: deep drei import`).toBe('@react-three/drei')
      expect(i.namespace, `${where}: namespace import of drei`).toBe(false)
      expect(i.defaultName, `${where}: default import of drei`).toBe(false)
      expect(i.dynamic, `${where}: dynamic import of drei`).toBe(false)
      for (const n of i.names) expect(DREI_ALLOW as readonly string[], `${where}: drei ${n} is not allow-listed`).toContain(n)
    }
  })

  it('never imports a banned decoder, text renderer, HDR loader or postprocessing', () => {
    for (const i of all) {
      for (const ban of BANNED_MODULES) expect(ban.test(i.specifier), `${relative(DIR, i.file)} imports ${i.specifier}`).toBe(false)
      for (const n of i.names) expect(BANNED_IDENTIFIERS, `${relative(DIR, i.file)} imports ${n} from ${i.specifier}`).not.toContain(n)
    }
  })

  it('never references HDRI/EXR files, decoder wasm or remote assets', () => {
    for (const f of files) {
      const src = readFileSync(f, 'utf8')
      expect(/\.(hdr|exr|ktx2|drc|glb|gltf)\b['"]/i.test(src), `${relative(DIR, f)} references a banned asset`).toBe(false)
      expect(/['"`]https?:\/\//.test(src), `${relative(DIR, f)} references a remote URL`).toBe(false)
      expect(/MeshTransmissionMaterial|troika|DRACOLoader|KTX2Loader|MeshoptDecoder/.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')), `${relative(DIR, f)} uses a banned API`).toBe(false)
    }
  })

  it('the test itself rejects a banned import (self-check)', () => {
    const fake: ImportDecl = { file: 'x.tsx', specifier: '@react-three/drei', names: ['Text'], typeOnly: false, dynamic: false, namespace: false, defaultName: false }
    expect((DREI_ALLOW as readonly string[]).includes(fake.names[0] as string)).toBe(false)
    expect(BANNED_IDENTIFIERS).toContain('Text')
  })
})

describe('the light entry never statically reaches three / R3F / drei', () => {
  const HEAVY = /^(three|three\/.*|@react-three\/.*)$/

  function resolveLocal(from: string, spec: string): string | null {
    if (!spec.startsWith('.')) return null
    const baseDir = dirname(from)
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const p = resolve(baseDir, spec + ext)
      try {
        if (statSync(p).isFile()) return p
      } catch {
        /* next */
      }
    }
    return null
  }

  it('walks every static value import from src/three/index.ts', () => {
    const seen = new Set<string>()
    const stack = [join(DIR, 'index.ts')]
    const offenders: string[] = []
    while (stack.length) {
      const file = stack.pop() as string
      if (seen.has(file)) continue
      seen.add(file)
      if (!/\.(ts|tsx)$/.test(file)) continue
      for (const i of imports(file)) {
        if (i.dynamic || i.typeOnly) continue
        if (HEAVY.test(i.specifier)) offenders.push(`${relative(DIR, file)} -> ${i.specifier}`)
        const local = resolveLocal(file, i.specifier)
        if (local) stack.push(local)
      }
    }
    expect(offenders).toEqual([])
    expect([...seen].some((f) => f.includes(`${join('three', 'scene')}`))).toBe(false)
    expect([...seen].some((f) => f.endsWith('generated.ts'))).toBe(false)
  })

  it('the scene kit is where the R3F imports live', () => {
    const scene = all.filter((i) => i.file.includes(join('three', 'scene')) && HEAVY.test(i.specifier))
    expect(scene.length).toBeGreaterThan(0)
  })
})
