---
"@trident/ui": major
---

Reconcile the `trident-ops` theme with the Ops brand rollout.

`themes.trident-ops` previously carried only a two-role accent override and otherwise sat on the
fleet base, so the package did not describe the product it names. It now carries the Ops brand
rollout's own palette as a full role override: bg `#0c1a26`, bg-2 / surface / surface-raised
`#0e242c`, line `#113738`, line-strong `#687688`, ink `#ffffff`, ink-2 `#d2d7e1`, muted `#9aa7bd`,
accent-1 `#2fd39a`, accent-2 `#0f9f72`, on-accent `#0b0b0d`, ok `#2fd39a`, warn `#f5b83d`, danger
`#ff6b5e`, info `#3ba8f0`, and `r-lg` 24px (the rollout's `xl` radius step, matching the studio
themes). Type stays the fleet's (Space Grotesk / Inter / JetBrains Mono) per spec §4; the rollout's
Playfair Display display face is not adopted here.

**Rendered colour changes** (this is a major bump because 31 §9 contrast-matrix ratios change for
this theme — ink, ink-2, muted, accent-text, on-accent, ok, warn, danger, info, focus and
line-strong on bg, bg-2 and surface. Every pair still passes, and no ratio falls below its floor):

- The Ops accent changes from `#34d399` / `#10b981` to `#2fd39a` / `#0f9f72`, and the whole Ops
  surface moves to the rollout's own background and line colours.

The live consumer (LocalOps) already rendered these values through 19 handwritten `--ui-*`
overrides in its own stylesheet; those overrides are now redundant. Its rendered output does not
change.

Only `trident-ops` is reconciled, because it is the only package theme with a live consumer. The
other fleet themes keep their released values.
