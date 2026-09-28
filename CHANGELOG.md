# @trident/ui

Managed with [Changesets](https://github.com/changesets/changesets) (`npx changeset`). Bump rules
are in `.changeset/README.md`: a contrast-affecting change is **major**, a new theme is **minor**,
and any rendered-colour change needs an entry here.

## 0.1.0-dev

- Foundation: tokens.json as the single source, generating `tokens.css`, `themes/*.css`
  (fleet, trident-studio, trident-nil, trident-ops, trident-playbook, trident-tools, trident-agents,
  wmh-portal, wmh-marketing, wmh-dark, portfolio, quorum, legacy-aliases), `tokens.mjs` and
  `three.mjs`.
- `ensureContrast()` / `accentVars()` and a contrast-matrix test over every theme and palette.
- Self-hosted variable fonts (Space Grotesk, Inter, JetBrains Mono, Manrope, Oswald; OFL) with
  metric-matched fallbacks; `trident-ui copy-assets` and `sync-tokens`.
- `@trident/ui/eslint` consumer rule for restricted surfaces.
- Empty component groups ready for the builders.
