# DESIGN-VERSION convention (spec §1 "Drift control", §10.3)

Every consuming repo keeps a one-line `DESIGN-VERSION` file at its root holding the `@trident/ui`
tag it is built against, e.g.

```
v0.1.0
```

and pins the dependency to the same tag:

```json
"@trident/ui": "github:Beauwilliams32/trident-ui#v0.1.0"
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
3. **Workspace report:** `scripts/ui-version-report.mjs` (workspace level) lists every repo's pin.
4. **Repos not yet on React** use `npx trident-ui sync-tokens <dir> --themes <theme>`, which writes
   `trident-ui-tokens.json` with a sha256 per file. A hash test in the repo compares its copies to
   that manifest (the `test/motion-system.test.js` pattern), so hand edits to synced CSS fail.

Only tags from CI or a clean `main` are valid pins; `npm run check:dist` must pass on the tag.
