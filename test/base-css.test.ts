/** Spec §0.2 / §6.3 / §6.4 rules the foundation stylesheet must encode. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const base = readFileSync(join(ROOT, 'src/styles/base.css'), 'utf8')

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? cssFiles(p) : p.endsWith('.css') ? [p] : []
  })
}

describe('base.css', () => {
  it('hides reveals only under html.ui-motion + scripting + no reduced motion + not paused, with a 2.5s failsafe', () => {
    expect(base).toContain('@media (scripting: enabled) and (prefers-reduced-motion: no-preference)')
    expect(base).toContain("html.ui-motion:not([data-motion='paused']) [data-reveal]")
    expect(base).toContain('animation: ui-reveal-failsafe 0s 2.5s forwards;')
  })

  it('has the reduced-motion and Pause kill switches', () => {
    expect(base).toContain('@media (prefers-reduced-motion: reduce)')
    expect(base).toContain("html[data-motion='paused'] *")
  })

  it('keeps !important inside the kill switches only (spec §6.4)', () => {
    const killStart = base.indexOf('Global motion kill switch')
    expect(killStart).toBeGreaterThan(0)
    expect(base.slice(0, killStart)).not.toContain('!important')
    for (const file of cssFiles(join(ROOT, 'src'))) {
      if (file.endsWith(join('styles', 'base.css'))) continue
      expect(readFileSync(file, 'utf8'), file).not.toContain('!important')
    }
  })

  it('never removes focus outlines', () => {
    expect(base).toMatch(/:focus-visible\s*{\s*outline: var\(--ui-focus-width\) solid var\(--ui-focus\)/)
    for (const file of cssFiles(join(ROOT, 'src'))) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/outline:\s*(none|0)\b/)
    }
  })
})
