# Consumers of @trident/ui — where each product's design layer comes from (2026-10-27)

Read-only audit. **This file is the report**: `docs/DESIGN-VERSION.md` rule 3 used to name a
workspace script (`scripts/ui-version-report.mjs`) that does not exist in
the workspace scripts directory; rather than invent a script that only one lane may not land,
the table below is the report and rule 3 now points here.

Nothing here changes a consumer. Every cell was read from the file named in the last column on
2026-10-27; where a mechanism has no version to read, the pin says **none** instead of a guess.

## What "current" means

Two different mechanisms are in use, so "behind" means two different things:

- **Package consumers** pin a tag (`@trident/ui` + a `DESIGN-VERSION` file). Current = the pin equals
  the newest released tag. The newest tag is **`v0.2.0`** (`df2fb04`, released 2026-10-26; `main` is
  past it only with unreleased docs).
- **CSS/theme consumers** do not consume the package at all. They either vendor the canonical
  `trident-social/design/trident-glass.css` (sha256 `a2228fe11b12…`) or carry their own token file.
  Current = the copy is byte-identical to the canonical file; a product with its own tokens is
  *current by construction* and can only be judged against the brand kit, not against a tag.

## The table

| Consumer | Mechanism | Pin | State | Planning | Evidence read |
|---|---|---|---|---|---|
| `localops-ai-saas` (Trident Ops) | **Package**, vendored tarball: `devDependencies["@trident/ui"] = "file:vendor/trident-ui-0.2.0.tgz"` plus a `DESIGN-VERSION` file | `v0.2.0` | **Current** — the pin is the newest tag (bumped 2026-10-26, `9675b9b`); it also vendors `src/frontend/trident-glass.css` byte-identical to the canonical file | n/a | `localops-ai-saas/package.json`, `DESIGN-VERSION`, `vendor/README.md`, `src/frontend/trident-glass.css` |
| `trident-social` (studio hub) | **CSS**, canonical: `design/trident-glass.css`, copied to `public/assets/trident-glass.css`; no `@trident/ui` dependency | none (it *is* the source of truth) | **Current by definition** — every other vendored copy is compared to this file | n/a | `trident-social/design/trident-glass.css` (sha `a2228fe1…`), `public/assets/trident-glass.css` (same) |
| `trident-tools` | **CSS**, two vendored copies: `public/assets/trident-glass.css` and `apps/mac/src/assets/trident-glass.css`; no dependency | none | **Current** — both copies byte-identical to the canonical file (the repo also has its own site layer, `public/assets/trident-tools.css`, for tool-only rules) | n/a | both files (sha `a2228fe1…`) |
| `trident-playbook` | **CSS, inlined**: a copy of `trident-glass.css` lives inside `src/worker.js` (its comment names `trident-social/design/trident-glass.css` as canonical); no dependency | **none — unknown** | **Unknown**: an inlined copy has no hash to compare, so drift is not measurable from outside. Treat it as "not tracked by this audit" rather than current | n/a | `trident-playbook/src/worker.js` lines 14–17 |
| `nil-platform` (Trident NIL) | **CSS, inlined**: copy inside `src/ui.js` (comment names the canonical file); no dependency | **none — unknown** | **Unknown** for the same reason as Playbook | n/a | `nil-platform/src/ui.js` lines 8, 789 |
| `williams-media-portal` | **Own design system**: `src/public/ds.css`; no `@trident/ui`, no glass copy | none | **Own system** — not a consumer today; adoption is a separate planning task | n/a | `williams-media-portal/package.json` (no entry), `src/public/ds.css` |
| `beau-portfolio` | **Own tokens**, merged: `public/styles.css` says "liquid-glass tokens (merged from trident-glass.css — surface + motion only)" | none | **Own system, partly derived** — surface + motion inherited, not tracked by hash | n/a | `beau-portfolio/public/styles.css` line 108 |
| `quorum` (cockpit) | **Own palette**: `public/tokens.css` is "the one palette" with `public/theme.js` as the runtime bridge; no dependency yet | none | **Own system**; the planned React rewrite pins `@trident/ui` to a **git tag** at P0 | n/a | `quorum/package.json` (no entry), `public/tokens.css`, `public/theme.js` |
| `trident-identity` | **Own palette**: `src/theme.js` `PALETTES`, moved onto the studio brand pair on 2026-10-26; no dependency | none | **Own system** (brand-migrated 2026-10-26) | n/a | `trident-identity/src/theme.js`, `package.json` (no entry) |

## What this audit deliberately does not say

- It does not claim any product is *visually* consistent with the brand; it says which layer supplies
  the colours and whether the bytes match. Visual acceptance is the brand packets' job.
- It does not rank the consumers. Ops is on the package because it was rebuilt on React; the others
  are CSS or own-token products, and separate planning decides if that changes.
- It changes nothing. No consumer's pin, copy or token file was edited by this pass.
