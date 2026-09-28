/** Spec §1 packaging contract. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

describe('package.json', () => {
  it('is @trident/ui, ESM, CSS-only side effects, no prepare script', () => {
    expect(pkg.name).toBe('@trident/ui')
    expect(pkg.type).toBe('module')
    expect(pkg.sideEffects).toEqual(['*.css'])
    expect(pkg.scripts.prepare).toBeUndefined()
    expect(pkg.scripts.prepublish).toBeUndefined()
    expect(pkg.scripts.postinstall).toBeUndefined()
  })

  it('exposes the full subpath export map', () => {
    for (const key of [
      '.',
      './server',
      './islands',
      './motion-lite',
      './motion',
      './app',
      './three',
      './tokens.css',
      './styles.css',
      './themes/*',
      './tokens.json',
      './tokens.mjs',
      './three.mjs',
      './fonts/*',
    ])
      expect(pkg.exports, key).toHaveProperty([key])
  })

  it('React 19.3 is a required peer; 3D, motion and app libraries are optional peers', () => {
    expect(pkg.peerDependencies.react).toBe('^19.3.0')
    expect(pkg.peerDependencies['react-dom']).toBe('^19.3.0')
    expect(pkg.peerDependencies.three).toBe('>=0.180.0 <0.187.0')
    expect(pkg.peerDependencies['@react-three/fiber']).toMatch(/^\^9\./)
    expect(pkg.peerDependencies['@react-three/drei']).toMatch(/^\^10\./)
    expect(pkg.peerDependencies.motion).toMatch(/^\^13\./)
    for (const opt of ['three', '@react-three/fiber', '@react-three/drei', 'motion', 'cmdk', 'sonner', '@radix-ui/react-dialog']) {
      expect(pkg.peerDependenciesMeta[opt], opt).toEqual({ optional: true })
    }
    expect(pkg.peerDependenciesMeta.react).toBeUndefined()
  })

  it('pins the dev copy of three to the fleet version 0.180.0', () => {
    expect(pkg.devDependencies.three).toBe('0.180.0')
  })

  it('ships a trident-ui bin', () => {
    expect(pkg.bin['trident-ui']).toBe('./bin/trident-ui.mjs')
  })
})
