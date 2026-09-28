# ESLint convention for consumers (spec §6.8)

3D (`@trident/ui/three`, `three`, R3F, drei) and the app motion tier (`@trident/ui/motion`) are
banned on **money, auth, legal/compliance and admin** surfaces. Enforce it in each repo with the
exported flat-config block:

```js
// eslint.config.js
import { restrictedSurfaces } from '@trident/ui/eslint'

export default [
  // ...your config
  restrictedSurfaces(), // default globs: billing/checkout/payments/pricing, auth/login/signup, legal/privacy/terms, admin
  // or scope it to your layout:
  restrictedSurfaces({ files: ['src/routes/{billing,login,legal,admin}/**'] }),
]
```

`restrictedSurfaceRule(extra)` returns just the `no-restricted-imports` entry if you compose rules
yourself. `@trident/ui/motion-lite` and the root `@trident/ui` stay allowed: those surfaces still get
state feedback (press, focus, 160ms fade, spinner, success tick).

This is one of three layers; the others are review and the runtime guard (`<Lazy3D>` refuses to
mount under `[data-surface="money|auth|legal|admin"]`).

Inside this package, `eslint.config.js` applies the same rule shape to keep optional peers
(three, R3F, motion, Radix, cmdk, sonner) and server code out of the root entry's groups.
