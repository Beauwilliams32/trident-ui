#!/usr/bin/env node
/** tokens.json -> dist/tokens.css, dist/themes/*.css, dist/tokens.json, dist/tokens.mjs, dist/three-tokens.mjs (+ .d.mts). */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT,
  buildFleetCss,
  buildLegacyAliasesCss,
  buildThemeCss,
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

console.log(`tokens: ${Object.keys(tokens.themes).length} themes + fleet + legacy-aliases -> dist/`)
