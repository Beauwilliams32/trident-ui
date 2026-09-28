/** Spec §4: self-hosted variable woff2, latin + latin-ext, metric-matched fallbacks, OFL only. */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const FAMILIES = ['space-grotesk', 'inter', 'jetbrains-mono', 'manrope', 'oswald']
const fonts = join(ROOT, 'fonts')
const css = readFileSync(join(fonts, 'fonts.css'), 'utf8')

describe('fonts/', () => {
  it.each(FAMILIES)('%s ships latin + latin-ext woff2, a per-family css and its OFL licence', (id) => {
    for (const subset of ['latin', 'latin-ext']) {
      const file = join(fonts, `${id}-${subset}-wght-normal.woff2`)
      expect(existsSync(file)).toBe(true)
      expect(readFileSync(file).subarray(0, 4).toString('latin1')).toBe('wOF2')
    }
    expect(existsSync(join(fonts, `${id}.css`))).toBe(true)
    expect(readFileSync(join(fonts, 'licenses', `${id}-OFL.txt`), 'utf8')).toMatch(/SIL OPEN FONT LICENSE/i)
  })

  it('every url() in fonts.css resolves to a shipped file', () => {
    const urls = [...css.matchAll(/url\('\.\/([^']+)'\)/g)].map((m) => m[1]!)
    expect(urls.length).toBeGreaterThanOrEqual(10)
    for (const u of urls) expect(existsSync(join(fonts, u)), u).toBe(true)
  })

  it('declares a metric-matched fallback face for every family', () => {
    const metrics = JSON.parse(readFileSync(join(fonts, 'metrics.json'), 'utf8'))
    for (const family of ['Space Grotesk', 'Inter', 'JetBrains Mono', 'Manrope', 'Oswald']) {
      expect(css).toContain(`font-family: '${family} Fallback';`)
      expect(metrics[family].sizeAdjust).toMatch(/^\d+\.\d+%$/)
    }
    expect(css).toMatch(/size-adjust: .*;\n\s+ascent-override: .*;\n\s+descent-override: .*;\n\s+line-gap-override:/)
  })

  it('never connects to Google Fonts', () => {
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })
})
