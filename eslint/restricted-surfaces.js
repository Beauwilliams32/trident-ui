// Consumer ESLint convention (spec §6.8 "Enforcement"): 3D and the motion/react tier are banned on
// money, auth, legal/compliance and admin surfaces. Consumers import this from
// "@trident/ui/eslint" (see docs/ESLINT.md) and scope it to those directories.

/** Imports that may never appear on a restricted surface. */
export const RESTRICTED_SURFACE_IMPORTS = Object.freeze([
  {
    name: '@trident/ui/three',
    message: 'No 3D on money, auth, legal or admin surfaces (spec §6.8). Use a static poster image.',
  },
  {
    name: '@trident/ui/motion',
    message: 'No motion/react tier on money, auth, legal or admin surfaces (spec §6.3 rule 4, §6.8). State feedback only.',
  },
  { name: 'three', message: 'No 3D on money, auth, legal or admin surfaces (spec §6.8).' },
  { name: '@react-three/fiber', message: 'No 3D on money, auth, legal or admin surfaces (spec §6.8).' },
  { name: '@react-three/drei', message: 'No 3D on money, auth, legal or admin surfaces (spec §6.8).' },
])

/** Default directory globs for restricted surfaces. Override per repo. */
export const RESTRICTED_SURFACE_GLOBS = Object.freeze([
  '**/{money,billing,checkout,payments,payouts,escrow,refunds,pricing}/**',
  '**/{auth,login,signup,oauth}/**',
  '**/{legal,privacy,terms,consent,compliance,contracts}/**',
  '**/admin/**',
])

/** The rule entry: `'no-restricted-imports': restrictedSurfaceRule()`. */
export function restrictedSurfaceRule(extra = []) {
  return ['error', { paths: [...RESTRICTED_SURFACE_IMPORTS, ...extra] }]
}

/** A ready-made flat-config block. `files` defaults to RESTRICTED_SURFACE_GLOBS. */
export function restrictedSurfaces({ files = RESTRICTED_SURFACE_GLOBS, extra = [] } = {}) {
  return { files: [...files], rules: { 'no-restricted-imports': restrictedSurfaceRule(extra) } }
}
