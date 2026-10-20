#!/usr/bin/env node
/**
 * Refresh the self-hosted fonts in fonts/ from @fontsource-variable/* (OFL-1.1).
 *
 * Writes (all committed; the package build never re-runs this):
 *   fonts/<family>-latin-wght-normal.woff2, fonts/<family>-latin-ext-wght-normal.woff2
 *   fonts/licenses/<family>-OFL.txt
 *   fonts/metrics.json   metric-matched fallback overrides, computed from the font files
 *   fonts/fonts.css      @font-face for every family + its "<Family> Fallback" face
 *   fonts/<family>.css   the same, one family per file (import only what a brand uses)
 *
 * Run: npm run fonts:sync   (after bumping an @fontsource-variable/* devDependency)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fontkit from 'fontkit'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'fonts')

/** Families shipped in the package (spec §4). Kula/Corner Bar/Filippa fonts live in the client repos. */
export const FAMILIES = [
  { id: 'space-grotesk', family: 'Space Grotesk', fallback: 'arial', role: 'display (fleet)' },
  { id: 'inter', family: 'Inter', fallback: 'arial', role: 'body (fleet, Ops, portfolio)' },
  { id: 'jetbrains-mono', family: 'JetBrains Mono', fallback: 'courier', role: 'mono (fleet, WMH)' },
  { id: 'manrope', family: 'Manrope', fallback: 'arial', role: 'display + body (WMH)' },
  { id: 'oswald', family: 'Oswald', fallback: 'arial', role: 'display (portfolio)' },
  { id: 'playfair-display', family: 'Playfair Display', fallback: 'times', role: 'display (Trident Studio brand, trident-ui themes)' },
]

/* System fallback metrics (hhea/OS2, units per em). Arial and Courier New are present on
 * macOS, Windows and most Linux desktops via Liberation, so they are the capsize-style targets.
 * Times New Roman is the serif target (Liberation Serif is metric-compatible); xAvgCharWidth is read from
 * the system file's OS/2 table, the same way as Arial and Courier New. */
const SYSTEM = {
  arial: { local: ['Arial', 'Liberation Sans', 'Helvetica Neue', 'Helvetica'], unitsPerEm: 2048, xAvgCharWidth: 904 },
  courier: { local: ['Courier New', 'Liberation Mono', 'Menlo'], unitsPerEm: 2048, xAvgCharWidth: 1229 },
  times: { local: ['Times New Roman', 'Liberation Serif', 'Times'], unitsPerEm: 2048, xAvgCharWidth: 821 },
}

const pct = (n) => `${(n * 100).toFixed(2)}%`

function subsetFace(css, subset) {
  // index.css lists one @font-face per subset, each preceded by a "/* <id>-<subset>-wght-normal */" comment.
  const re = new RegExp(`/\\*[^*]*-${subset}-wght-normal \\*/\\s*@font-face\\s*{([^}]*)}`)
  const m = css.match(re)
  if (!m) throw new Error(`no ${subset} face found`)
  const body = m[1]
  return {
    weight: body.match(/font-weight:\s*([^;]+);/)[1].trim(),
    range: body.match(/unicode-range:\s*([^;]+);/)[1].trim(),
  }
}

/* English letter frequencies (capsize's weighting, incl. space) — used to compare the average
 * advance of running text, not xAvgCharWidth, which variable fonts inflate with wide glyphs. */
const FREQ = { ' ': 0.1818, e: 0.1039, t: 0.0741, a: 0.0668, o: 0.0614, i: 0.057, n: 0.0552, s: 0.0518, h: 0.0499, r: 0.049, d: 0.0348, l: 0.0329, c: 0.0228, u: 0.0226, m: 0.0197, w: 0.0193, f: 0.0182, g: 0.0165, y: 0.0162, p: 0.0158, b: 0.0122, v: 0.008, k: 0.0063, j: 0.0013, x: 0.0012, q: 0.0008, z: 0.0006 }

function weightedAdvance(font) {
  let sum = 0
  let weight = 0
  for (const [ch, w] of Object.entries(FREQ)) {
    const glyph = font.glyphForCodePoint(ch.codePointAt(0))
    sum += glyph.advanceWidth * w
    weight += w
  }
  return sum / weight / font.unitsPerEm
}

function metricsFor(fontPath, sys) {
  const font = fontkit.openSync(fontPath)
  // Default instance: each family's default wght axis value is its regular (400) master.
  const upm = font.unitsPerEm
  const avg = weightedAdvance(font)
  const sysAvg = sys.xAvgCharWidth / sys.unitsPerEm
  const sizeAdjust = avg / sysAvg
  const ascent = font.hhea.ascent / upm
  const descent = Math.abs(font.hhea.descent) / upm
  const lineGap = font.hhea.lineGap / upm
  return {
    sizeAdjust: pct(sizeAdjust),
    ascentOverride: pct(ascent / sizeAdjust),
    descentOverride: pct(descent / sizeAdjust),
    lineGapOverride: pct(lineGap / sizeAdjust),
  }
}

export function faceCss(f, faces, m) {
  const sys = SYSTEM[f.fallback]
  const lines = [`/* ${f.family} — ${f.role}. OFL-1.1, see licenses/${f.id}-OFL.txt */`]
  for (const face of faces) {
    lines.push(
      `@font-face {`,
      `  font-family: '${f.family}';`,
      `  font-style: normal;`,
      `  font-display: swap;`,
      `  font-weight: ${face.weight};`,
      `  src: url('./${face.file}') format('woff2-variations'), url('./${face.file}') format('woff2');`,
      `  unicode-range: ${face.range};`,
      `}`,
    )
  }
  lines.push(
    `@font-face {`,
    `  font-family: '${f.family} Fallback';`,
    `  src: ${sys.local.map((n) => `local('${n}')`).join(', ')};`,
    `  size-adjust: ${m.sizeAdjust};`,
    `  ascent-override: ${m.ascentOverride};`,
    `  descent-override: ${m.descentOverride};`,
    `  line-gap-override: ${m.lineGapOverride};`,
    `}`,
  )
  return lines.join('\n') + '\n'
}

function main() {
  mkdirSync(join(out, 'licenses'), { recursive: true })
  const metrics = {}
  const all = ['/* @trident/ui self-hosted fonts. Generated by scripts/sync-fonts.mjs — do not edit. */']
  for (const f of FAMILIES) {
    const pkgDir = dirname(require.resolve(`@fontsource-variable/${f.id}/package.json`))
    const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
    if (pkg.license !== 'OFL-1.1') throw new Error(`${f.id}: expected OFL-1.1, got ${pkg.license}`)
    const css = readFileSync(join(pkgDir, 'index.css'), 'utf8')
    const faces = []
    for (const subset of ['latin-ext', 'latin']) {
      const file = `${f.id}-${subset}-wght-normal.woff2`
      copyFileSync(join(pkgDir, 'files', file), join(out, file))
      faces.push({ file, ...subsetFace(css, subset) })
    }
    copyFileSync(join(pkgDir, 'LICENSE'), join(out, 'licenses', `${f.id}-OFL.txt`))
    const m = metricsFor(join(out, `${f.id}-latin-wght-normal.woff2`), SYSTEM[f.fallback])
    metrics[f.family] = { source: `@fontsource-variable/${f.id}@${pkg.version}`, fallback: SYSTEM[f.fallback].local[0], ...m }
    const block = faceCss(f, faces, m)
    writeFileSync(join(out, `${f.id}.css`), `/* Generated by scripts/sync-fonts.mjs — do not edit. */\n${block}`)
    all.push(block)
  }
  writeFileSync(join(out, 'fonts.css'), all.join('\n'))
  writeFileSync(join(out, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n')
  console.log(`fonts: ${FAMILIES.length} families synced into fonts/`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
