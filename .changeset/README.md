# Changesets

Every PR that changes shipped output adds a changeset: `npx changeset`.

Bump rules for `@trident/ui` (spec §1):

- Any change that affects **contrast** (a colour role that appears in the contrast matrix) is a **major** bump.
- A **new theme** is a **minor** bump.
- Any change to **rendered colour** needs a CHANGELOG entry, even when it is a patch.
- New components or exports are minor; fixes are patch.

Releases are tagged only from CI or a clean `main`; `npm run check:dist` (dist-matches-source) must pass first.
