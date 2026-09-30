/**
 * Budget (spec §1, §9): motion-lite is "about 2KB gz". Bundled + minified from source with
 * esbuild, a page that only calls initMotion() must stay under 3KB gz (the portal's 07-motion.js,
 * which it replaces, is about 2.8KB gz), and the whole entry under 3.5KB gz, with no imports.
 */
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

// esbuild's JS API refuses to run under jsdom (TextEncoder realm check), so use its CLI.
const esbuildBin = join(createRequire(import.meta.url).resolve('esbuild'), '../../bin/esbuild')

function gz(contents: string): { bytes: number; code: string } {
  const code = execFileSync(esbuildBin, ['--bundle', '--minify', '--format=esm', '--platform=browser', '--loader=ts'], {
    input: contents,
    cwd: import.meta.dirname,
    encoding: 'utf8',
  })
  return { bytes: gzipSync(code).length, code }
}

describe('motion-lite size budget', () => {
  it('initMotion() alone < 3KB gz, full entry < 3.5KB gz, no dependencies', () => {
    const boot = gz(`import { initMotion } from './index'; initMotion()`)
    expect(boot.bytes).toBeLessThan(3000)
    const all = gz(`export * from '${join(import.meta.dirname, 'index')}'`)
    expect(all.bytes).toBeLessThan(3500)
    expect(all.code).not.toMatch(/\bfrom\s*["']/)
  })
})
