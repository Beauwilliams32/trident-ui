#!/usr/bin/env node
/**
 * trident-ui CLI (spec §1).
 *
 *   trident-ui copy-assets <dir> [--fonts a,b] [--posters <srcDir>]
 *       Copy the self-hosted fonts (woff2 + css + OFL licences) into <dir>/fonts, and optional
 *       locally rendered posters into <dir>/posters, e.g. a Cloudflare Workers assets directory.
 *   trident-ui sync-tokens <dir> [--themes a,b]
 *       Copy tokens.css, the chosen themes and legacy-aliases.css into <dir>, each with a
 *       sha256 manifest, for projects not yet on React (hash-test pattern).
 *   trident-ui poster ...
 *       Local Playwright + SwiftShader poster render. Not in the v0.1 foundation; see docs/DEVIATIONS.md.
 *
 * No network access, no cloud services.
 */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const USAGE = `Usage:
  trident-ui copy-assets <dir> [--fonts space-grotesk,inter] [--posters <srcDir>]
  trident-ui sync-tokens <dir> [--themes trident-ops,wmh-portal]
  trident-ui poster            (not yet available in v0.1)
`

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=')
      flags[k] = inline ?? argv[++i]
      if (flags[k] === undefined) throw new Error(`--${k} needs a value`)
    } else positional.push(a)
  }
  return { positional, flags }
}

const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : null)
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')

function copyInto(src, destDir, name = src.split(/[\\/]/).pop()) {
  mkdirSync(destDir, { recursive: true })
  const dest = join(destDir, name)
  copyFileSync(src, dest)
  return dest
}

export function copyAssets(dir, { fonts, posters } = {}) {
  const out = resolve(dir)
  const fontsSrc = join(PKG_ROOT, 'fonts')
  const fontsDest = join(out, 'fonts')
  const copied = []
  const families = fonts || null
  for (const f of readdirSync(fontsSrc)) {
    const full = join(fontsSrc, f)
    if (statSync(full).isDirectory()) continue
    if (f === 'metrics.json') continue
    if (families && f !== 'fonts.css' && !families.some((id) => f.startsWith(`${id}-`) || f === `${id}.css`)) continue
    copied.push(copyInto(full, fontsDest))
  }
  for (const lic of readdirSync(join(fontsSrc, 'licenses'))) {
    if (families && !families.some((id) => lic.startsWith(`${id}-`))) continue
    copied.push(copyInto(join(fontsSrc, 'licenses', lic), join(fontsDest, 'licenses')))
  }
  if (posters) {
    const src = resolve(posters)
    if (!existsSync(src)) throw new Error(`posters dir not found: ${src}`)
    for (const f of readdirSync(src)) {
      if (/\.(avif|webp|png|jpe?g)$/i.test(f)) copied.push(copyInto(join(src, f), join(out, 'posters')))
    }
  }
  return copied
}

export function syncTokens(dir, { themes } = {}) {
  const out = resolve(dir)
  const dist = join(PKG_ROOT, 'dist')
  if (!existsSync(join(dist, 'tokens.css'))) throw new Error('dist/tokens.css missing: run npm run build in @trident/ui first')
  const available = readdirSync(join(dist, 'themes')).map((f) => f.replace(/\.css$/, ''))
  const chosen = themes || available
  for (const t of chosen) if (!available.includes(t)) throw new Error(`unknown theme ${t} (have: ${available.join(', ')})`)
  const files = [copyInto(join(dist, 'tokens.css'), out)]
  for (const t of new Set([...chosen, 'legacy-aliases'])) files.push(copyInto(join(dist, 'themes', `${t}.css`), join(out, 'themes')))
  const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'))
  const manifest = {
    package: pkg.name,
    version: pkg.version,
    files: Object.fromEntries(files.map((f) => [f.slice(out.length + 1).split('\\').join('/'), sha256(f)])),
  }
  writeFileSync(join(out, 'trident-ui-tokens.json'), JSON.stringify(manifest, null, 2) + '\n')
  return files
}

function main(argv) {
  const [cmd, ...rest] = argv
  const { positional, flags } = parseArgs(rest)
  switch (cmd) {
    case 'copy-assets': {
      if (!positional[0]) throw new Error('copy-assets needs a target directory')
      const files = copyAssets(positional[0], { fonts: list(flags.fonts), posters: flags.posters })
      console.log(`trident-ui: copied ${files.length} asset file(s) into ${resolve(positional[0])}`)
      return 0
    }
    case 'sync-tokens': {
      if (!positional[0]) throw new Error('sync-tokens needs a target directory')
      const files = syncTokens(positional[0], { themes: list(flags.themes) })
      console.log(`trident-ui: synced ${files.length} token file(s) into ${resolve(positional[0])}`)
      return 0
    }
    case 'poster':
      console.error('trident-ui poster: not available in v0.1 (local Playwright + SwiftShader render lands with @trident/ui/three).')
      return 2
    case undefined:
    case '-h':
    case '--help':
      console.log(USAGE)
      return cmd ? 0 : 1
    default:
      console.error(`trident-ui: unknown command ${cmd}\n\n${USAGE}`)
      return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (err) {
    console.error(`trident-ui: ${err.message}`)
    process.exitCode = 1
  }
}
