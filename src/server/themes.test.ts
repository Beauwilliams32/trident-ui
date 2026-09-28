import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { THEME_SCHEMES } from './themes'

const tokens = JSON.parse(readFileSync(join(import.meta.dirname, '../../tokens.json'), 'utf8'))

describe('THEME_SCHEMES', () => {
  it('matches tokens.json (fleet base + every theme, with its native scheme)', () => {
    const expected: Record<string, string> = { fleet: 'dark' }
    for (const [name, theme] of Object.entries<{ scheme?: string }>(tokens.themes)) expected[name] = theme.scheme ?? 'dark'
    expect(THEME_SCHEMES).toEqual(expected)
  })
})
