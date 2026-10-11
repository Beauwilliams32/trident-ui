/** Spec §1 packaging contract. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../scripts/lib/tokens.mjs'

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

describe('package.json', () => {
  it('is @trident/ui, ESM, CSS-only side effects', () => {
    expect(pkg.name).toBe('@trident/ui')
    expect(pkg.type).toBe('module')
    expect(pkg.sideEffects).toEqual(['*.css'])
    expect(pkg.scripts.prepublish).toBeUndefined()
  })

  // Consumers install `github:Beauwilliams32/trident-ui#vX.Y.Z` with dist/ committed on the tag.
  // npm (pacote lib/git.js, #prepareDir) "prepares" a git dependency when its package.json has
  // workspaces or any of these scripts: it runs a full `npm install --force --include=dev` in a temp
  // clone before packing. v0.1.0 had a `build` script, so its install either pulled every
  // devDependency or (npm 11.12) failed outright with "git dep preparation failed".
  it('has no script that makes npm prepare the git dependency, so an install is a plain fetch', () => {
    for (const name of ['postinstall', 'build', 'preinstall', 'install', 'prepack', 'prepare'])
      expect(pkg.scripts[name], `scripts.${name} triggers git dep preparation`).toBeUndefined()
    expect(pkg.workspaces).toBeUndefined()
    expect(pkg.scripts['build:lib']).toMatch(/vite build/)
    expect(pkg.scripts.check).toContain('npm run build:lib')
  })

  it('exposes the full subpath export map', () => {
    for (const key of [
      '.',
      './server',
      './islands',
      './motion-lite',
      './motion',
      './app',
      './marketing',
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
