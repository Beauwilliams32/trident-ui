#!/usr/bin/env node
/** After a build: every package.json export target (and every theme) must exist. */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, loadTokens } from './lib/tokens.mjs'
import pkg from '../package.json' with { type: 'json' }

const missing = []
const check = (rel) => {
  if (!existsSync(join(ROOT, rel))) missing.push(rel)
}
for (const [key, target] of Object.entries(pkg.exports)) {
  if (key.includes('*')) continue
  const targets = typeof target === 'string' ? [target] : Object.values(target)
  targets.forEach(check)
}
const tokens = loadTokens()
for (const name of [...Object.keys(tokens.themes), 'fleet', 'legacy-aliases']) check(`dist/themes/${name}.css`)
check('fonts/fonts.css')
const woff2 = readdirSync(join(ROOT, 'fonts')).filter((f) => f.endsWith('.woff2'))
if (woff2.length < 10) missing.push(`fonts/*.woff2 (found ${woff2.length}, expected 10)`)
if (missing.length) {
  console.error(`check-exports: missing build outputs:\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
console.log(`check-exports: ${Object.keys(pkg.exports).length} export entries resolve`)
