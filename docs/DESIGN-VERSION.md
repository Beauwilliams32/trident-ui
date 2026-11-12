# DESIGN-VERSION convention (spec §1 "Drift control", §10.3)

Every consuming repo keeps a one-line `DESIGN-VERSION` file at its root holding the `@trident/ui`
tag it is built against, e.g.

```
v0.2.0
```

and pins the dependency to the same tag:

```json
"@trident/ui": "github:Beauwilliams32/trident-ui#v0.2.0"
```

Rules:

1. **A test asserts they agree.** Read `DESIGN-VERSION`, read the resolved `@trident/ui` entry in
   `package-lock.json` (`packages["node_modules/@trident/ui"].resolved`), and fail unless the lockfile
   URL ends in `#<tag>` or resolves to that tag's commit. Minimal shape:

   ```js
   const want = readFileSync('DESIGN-VERSION', 'utf8').trim()
   const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
   const got = lock.packages['node_modules/@trident/ui'].resolved
   assert.ok(got.includes(want) || got.endsWith(tagSha(want)), `DESIGN-VERSION ${want} vs lockfile ${got}`)
   ```

2. **Bump both in one commit**, with the CHANGELOG entries between the old and new tag read first.
   A **major** bump means a contrast-affecting change (spec §1): re-run the repo's visual and axe
   checks before merging.
3. **Workspace report:** [`docs/CONSUMERS.md`](CONSUMERS.md) lists every repo's mechanism and pin
   (audited 2026-10-27, read-only, one row per consumer). There is no generator script: an earlier
   version of this rule named `scripts/ui-version-report.mjs` at the workspace level, and that file
   does not exist. Two mechanisms are in use — a tag pin (Ops) and a vendored/inlined CSS copy or a
   product's own tokens (everything else) — so the table states which one applies per repo rather
   than pretending every consumer has a tag to compare.
4. **Repos not yet on React** use `npx trident-ui sync-tokens <dir> --themes <theme>`, which writes
   `trident-ui-tokens.json` with a sha256 per file. A hash test in the repo compares its copies to
   that manifest (the `test/motion-system.test.js` pattern), so hand edits to synced CSS fail.

Only tags from CI or a clean `main` are valid pins; `npm run check:dist` must pass on the tag. npm 12 requires an explicit Git dependency policy: run `npm install --allow-git=all` (or `npm ci --allow-git=all`) for the pinned manifest dependency. The same setting works on npm 11; `allow-git=root` is supported in npm 12.0.2 and npm 11.20.0, but fails in npm 11.12.0.
