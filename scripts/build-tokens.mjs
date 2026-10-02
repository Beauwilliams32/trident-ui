#!/usr/bin/env node
/**
 * tokens.json -> dist/tokens.css, dist/themes/*.css, dist/tokens.json, dist/tokens.mjs, dist/three-tokens.mjs (+ .d.mts),
 * and the committed src/three/generated-colors.json (the lazy 3D colour table; a unit test keeps it in sync).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT,
  THREE_COLOR_TABLE_FILE,
  buildFleetCss,
  buildLegacyAliasesCss,
  buildThemeCss,
  buildThreeColorTableJson,
  buildThreeModule,
  buildTokensCss,
  buildTokensModule,
  loadTokens,
} from './lib/tokens.mjs'

const dist = join(ROOT, 'dist')
const tokens = loadTokens()
mkdirSync(join(dist, 'themes'), { recursive: true })

writeFileSync(join(dist, 'tokens.css'), buildTokensCss(tokens))
writeFileSync(join(dist, 'themes', 'fleet.css'), buildFleetCss(tokens))
for (const name of Object.keys(tokens.themes)) writeFileSync(join(dist, 'themes', `${name}.css`), buildThemeCss(tokens, name))
writeFileSync(join(dist, 'themes', 'legacy-aliases.css'), buildLegacyAliasesCss(tokens))
copyFileSync(join(ROOT, 'tokens.json'), join(dist, 'tokens.json'))

const mod = buildTokensModule(tokens)
writeFileSync(join(dist, 'tokens.mjs'), mod.js)
writeFileSync(join(dist, 'tokens.d.mts'), mod.dts)
const three = buildThreeModule(tokens)
writeFileSync(join(dist, 'three-tokens.mjs'), three.js)
writeFileSync(join(dist, 'three-tokens.d.mts'), three.dts)

// Source, not dist: vitest runs before any build. Only rewrite on change so a clean tree stays clean.
const tablePath = join(ROOT, THREE_COLOR_TABLE_FILE)
const table = buildThreeColorTableJson(tokens)
if (!existsSync(tablePath) || readFileSync(tablePath, 'utf8') !== table) {
  writeFileSync(tablePath, table)
  console.log(`tokens: updated ${THREE_COLOR_TABLE_FILE}; commit it with the tokens.json change`)
}

console.log(`tokens: ${Object.keys(tokens.themes).length} themes + fleet + legacy-aliases -> dist/`)
