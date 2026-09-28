/** bin/trident-ui.mjs (spec §1): copy-assets and sync-tokens. */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const BIN = join(ROOT, 'bin', 'trident-ui.mjs')
const dirs: string[] = []
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'trident-ui-cli-'))
  dirs.push(d)
  return d
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

describe('trident-ui copy-assets', () => {
  it('copies every font, its css and its licence', () => {
    const out = tmp()
    execFileSync(process.execPath, [BIN, 'copy-assets', out])
    const files = readdirSync(join(out, 'fonts'))
    expect(files.filter((f) => f.endsWith('.woff2'))).toHaveLength(10)
    expect(files).toContain('fonts.css')
    expect(readdirSync(join(out, 'fonts', 'licenses'))).toHaveLength(5)
  })

  it('--fonts limits the families', () => {
    const out = tmp()
    execFileSync(process.execPath, [BIN, 'copy-assets', out, '--fonts', 'inter,space-grotesk'])
    const woff2 = readdirSync(join(out, 'fonts')).filter((f) => f.endsWith('.woff2'))
    expect(woff2.sort()).toEqual([
      'inter-latin-ext-wght-normal.woff2',
      'inter-latin-wght-normal.woff2',
      'space-grotesk-latin-ext-wght-normal.woff2',
      'space-grotesk-latin-wght-normal.woff2',
    ])
    expect(existsSync(join(out, 'fonts', 'inter.css'))).toBe(true)
  })

  it('fails without a target directory', () => {
    expect(() => execFileSync(process.execPath, [BIN, 'copy-assets'], { stdio: 'pipe' })).toThrow()
  })
})

describe.skipIf(!existsSync(join(ROOT, 'dist', 'tokens.css')))('trident-ui sync-tokens', () => {
  it('copies tokens + chosen themes + legacy aliases with a sha256 manifest', () => {
    const out = tmp()
    execFileSync(process.execPath, [BIN, 'sync-tokens', out, '--themes', 'trident-ops'])
    expect(readdirSync(join(out, 'themes')).sort()).toEqual(['legacy-aliases.css', 'trident-ops.css'])
    const manifest = JSON.parse(readFileSync(join(out, 'trident-ui-tokens.json'), 'utf8'))
    expect(manifest.package).toBe('@trident/ui')
    expect(Object.keys(manifest.files)).toContain('tokens.css')
    expect(manifest.files['tokens.css']).toMatch(/^[0-9a-f]{64}$/)
  })
})
