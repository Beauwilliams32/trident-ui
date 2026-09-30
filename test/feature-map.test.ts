/**
 * Workspace rule: every feature has a FEATURE-MAP.md row and a test. v0.1 merged six component
 * groups, the gallery and its Playwright suites without rows, on `npm run check` alone. This keeps
 * the map honest and keeps the Playwright suites inside the one gate command.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const map = readFileSync(join(ROOT, 'FEATURE-MAP.md'), 'utf8')
const rows = map
  .split('\n')
  .filter((l) => l.startsWith('|') && !/^\|\s*(Feature|-+)\s*\|/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

describe('FEATURE-MAP.md', () => {
  it('has four cells in every row', () => {
    expect(rows.length).toBeGreaterThan(20)
    for (const r of rows) expect(r, r.join(' | ')).toHaveLength(4)
  })

  it('has a row for every source group under src/', () => {
    const groups = readdirSync(join(ROOT, 'src'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    expect(groups.length).toBeGreaterThanOrEqual(14)
    const where = rows.map((r) => r[1]).join('\n')
    for (const g of groups) expect(where, `no FEATURE-MAP row points at src/${g}/`).toContain(`src/${g}/`)
  })

  it('cites only paths that exist', () => {
    const cited = new Set<string>()
    for (const r of rows)
      for (const cell of [r[1]!, r[3]!])
        for (const m of cell.matchAll(/`([^`]+)`/g)) {
          const path = m[1]!.split('#')[0]!
          if (/[\\/.]/.test(path) && !path.includes(' ')) cited.add(path)
        }
    expect(cited.size).toBeGreaterThan(40)
    for (const p of cited) expect(existsSync(join(ROOT, p)), `${p} is cited in FEATURE-MAP.md but does not exist`).toBe(true)
  })

  it('names a test file for every row marked tested', () => {
    for (const r of rows) {
      if (!/^yes/.test(r[2]!)) continue
      expect(r[3], `${r[0]} is marked tested but cites no file`).toMatch(/`[^`]+`/)
    }
  })
})

describe('npm run gate', () => {
  it('runs check, check:dist, the gallery build and both Playwright suites, in that order', () => {
    const steps = String(pkg.scripts.gate).split('&&').map((s: string) => s.trim())
    expect(steps).toEqual(['npm run check', 'npm run check:dist', 'npm run gallery:build', 'npm run gallery:e2e'])
    // gallery:e2e must stay the unfiltered run: visual.spec.ts and axe.spec.ts both live in testDir.
    expect(pkg.scripts['gallery:e2e']).toBe('playwright test')
    for (const spec of ['visual.spec.ts', 'axe.spec.ts']) expect(existsSync(join(ROOT, 'gallery/tests', spec)), spec).toBe(true)
  })
})
