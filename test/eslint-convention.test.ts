/** Spec §6.8 enforcement: the exported consumer rule blocks 3D and the motion tier on restricted surfaces. */
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { RESTRICTED_SURFACE_GLOBS, restrictedSurfaces } from '../eslint/restricted-surfaces.js'

const linter = new Linter({ configType: 'flat' })
const config = [{ languageOptions: { ecmaVersion: 2023 as const, sourceType: 'module' as const } }, restrictedSurfaces()]
const lint = (code: string, filename: string) =>
  linter.verify(code, config, { filename }).filter((m) => m.ruleId === 'no-restricted-imports')

describe('@trident/ui/eslint restrictedSurfaces()', () => {
  it.each([
    'src/billing/Checkout.js',
    'src/auth/Login.js',
    'src/legal/Terms.js',
    'src/admin/Users.js',
  ])('blocks @trident/ui/three and @trident/ui/motion in %s', (file) => {
    expect(lint("import { Lazy3D } from '@trident/ui/three'", file)).toHaveLength(1)
    expect(lint("import { Reveal } from '@trident/ui/motion'", file)).toHaveLength(1)
    expect(lint("import * as THREE from 'three'", file)).toHaveLength(1)
  })

  it('allows the static tiers on restricted surfaces', () => {
    expect(lint("import { Button } from '@trident/ui'\nimport { reduced } from '@trident/ui/motion-lite'", 'src/billing/Pay.js')).toHaveLength(0)
  })

  it('does not apply outside restricted surfaces', () => {
    expect(lint("import { Lazy3D } from '@trident/ui/three'", 'src/marketing/Hero.js')).toHaveLength(0)
  })

  it('covers money, auth, legal and admin globs', () => {
    const all = RESTRICTED_SURFACE_GLOBS.join(' ')
    for (const word of ['billing', 'checkout', 'auth', 'login', 'legal', 'privacy', 'admin']) expect(all).toContain(word)
  })
})
