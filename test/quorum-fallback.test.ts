/**
 * Spec §10.3: generated three.mjs equals Quorum's FALLBACK map. The generated map is pinned here;
 * when a sibling Quorum checkout exists (../quorum/public/theme.js) it is compared directly too.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT, loadTokens, quorumFallback } from '../scripts/lib/tokens.mjs'

const tokens = loadTokens()
const generated = quorumFallback(tokens)
const quorumTheme = join(ROOT, '..', 'quorum', 'public', 'theme.js')

describe('Quorum FALLBACK', () => {
  it('generates all twenty theme.js names as #rrggbb', () => {
    expect(Object.keys(generated)).toHaveLength(20)
    for (const v of Object.values(generated)) expect(v).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('agrees with the quorum theme roles', () => {
    const q = tokens.themes.quorum.roles
    expect(generated['--bg']).toBe(q.bg)
    expect(generated['--fg0']).toBe(q.ink)
    expect(generated['--accent']).toBe(q['accent-1'])
    expect(generated['--purple']).toBe(q['status-reasoning'])
  })

  it.skipIf(!existsSync(quorumTheme))('equals quorum/public/theme.js FALLBACK', () => {
    // Parse the literal table rather than importing: theme.js is a browser module outside this root.
    const src = readFileSync(quorumTheme, 'utf8')
    const body = src.slice(src.indexOf('export const FALLBACK = {'), src.indexOf('}', src.indexOf('export const FALLBACK = {')))
    const fallback = Object.fromEntries([...body.matchAll(/'(--[\w-]+)':\s*'(#[0-9a-fA-F]{3,6})'/g)].map((m) => [m[1], m[2]!.toLowerCase()]))
    expect(Object.keys(fallback).length).toBeGreaterThan(0)
    expect(generated).toEqual(fallback)
  })
})
