---
'@trident/ui': patch
---

`@trident/ui/three`: the lazy colour module now ships a precomputed per-theme int table
(`src/three/generated-colors.json`, written by `npm run build:tokens`) instead of all of
tokens.json, cutting the lazy 3D chunk from 248.9 kB to 246.6 kB gz so CI's `npm run size` passes.
No change to any resolved colour, API or contrast.
