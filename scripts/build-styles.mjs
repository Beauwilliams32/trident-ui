#!/usr/bin/env node
/**
 * dist/styles.css = src/styles/base.css + each group's src/<group>/styles.css, in a fixed order,
 * so parallel builders only ever touch their own directory. Missing group files are skipped.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { HEADER, ROOT } from './lib/tokens.mjs'

export const STYLE_GROUPS = [
  'a11y',
  'layout',
  'type',
  'actions',
  'forms',
  'display',
  'feedback',
  'server',
  'islands',
  'motion-lite',
  'motion',
  'app',
  'three',
]

const parts = [HEADER.replace('tokens.json by scripts/build-tokens.mjs', 'src/**/styles.css by scripts/build-styles.mjs')]
parts.push(`/* --- src/styles/base.css --- */\n${readFileSync(join(ROOT, 'src/styles/base.css'), 'utf8')}`)
let groups = 0
for (const g of STYLE_GROUPS) {
  const file = join(ROOT, 'src', g, 'styles.css')
  if (!existsSync(file)) continue
  groups++
  parts.push(`/* --- src/${g}/styles.css --- */\n@layer ui-components {\n${readFileSync(file, 'utf8')}\n}`)
}
writeFileSync(join(ROOT, 'dist', 'styles.css'), parts.join('\n'))
console.log(`styles: base + ${groups} group stylesheet(s) -> dist/styles.css`)
