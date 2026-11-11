# Trident UI: Final Design System Spec (v1.0)

**Base proposal:** Engineering-first `@trident/ui`. It had the highest mean judge score, about 8.63 (8.6, 8.7 and 8.6).

**Ideas added from the other proposals:**
- From Craft-first Trident UI (mean 8.13):
  - Radix Primitives, cmdk and sonner.
  - The signature 3D scene for each product, with its honesty rules.
  - `useQualityTier()`.
  - No 3D on a page while a form field has focus.
  - In apps, 3D only for empty states and success moments: at most 60KB, and it stops after 3s.
  - Three pinned to one version shared with Quorum.
  - Detailed type, elevation and spring specs.
  - The Corner Bar stamp exception.
- From Brand-and-a11y-first Trident Core (mean 7.67):
  - A `--ui-accent-text` token.
  - Runtime `ensureContrast()`.
  - A persistent "Pause motion" control (WCAG 2.2.2).
  - Keyboard alternatives to dragging (WCAG 2.5.7) and focus that the sticky nav never hides (2.4.11).
  - three.js colour constants generated from tokens.json.

**Status:** this is a proposal. §0 lists what must be decided before any code lands.

---

## 0. Preconditions and contradictions resolved

### 0.1 Order of work before code
1. **Amend `trident-social/design/DESIGN.md` first**, as the single source for the design spec. Today it forbids light themes, new hues, parallax and anything beyond transform/opacity, and it has no rule for 3D. The amendment adds:
   - §3D: allowed only inside `<Lazy3D>` slots, with the forbidden-surface list from §6.4.
   - §Light surfaces: allowed for the WMH portal and client brands only.
   - §Client brands: client brands keep their own palettes.
   - Pointer or scroll camera movement inside a decorative canvas, capped at ±4°. No page-level parallax.
   - The Pause-motion rule.
   - Retire the stale `nil-platform/DESIGN.md` (green brutalist) and the green 404 at `worker.js:1991`.
2. **Land the work already in flight, or wait for it to land.** Design-system work must come after each of these:
   - The WMH prerender worktree `.claude/worktrees/prerender-marketing-20260925`.
   - Ops PR #12 (WidgetGrid, AIInsightsPage).
   - NIL money-paths PR #13 (`claude/trident-nil-money-paths-20260926`, 89bf2d8).
   - Filippa's release that is waiting on owner sign-off.
   - The dirty file in Quorum (`scripts/openclaw-local-pulse.py`).
3. **Get owner decisions (§0.3).** Then cut `trident-ui` v0.1.

### 0.2 Contradictions and how they were resolved

| Topic | Options on the table | Resolution |
|---|---|---|
| Packaging | Private GitHub Packages; public git dependency; vendored tarballs | **Public MIT repo, installed as a git dependency pinned to a tag, with `dist/` committed on each tag and no `prepare` script.** It needs no auth anywhere: Netlify, Vercel, Quorum buyers and the open-core repo all install it anonymously. **Client-brand themes (Kula, Corner Bar, Filippa) stay in the client repos** and build on the public token contract, so the public repo carries no client work. |
| three version | 0.180.0 (Quorum) or 0.186.x (latest on the registry) | **One pinned version for the whole portfolio. Start at 0.180.0** so Quorum and the package share one copy. Move to 0.186.x later as one tracked, fleet-wide bump, gated by the `renderer.info` budget test and size-limit. Peer range: `>=0.180.0 <0.187.0`. |
| Overlays | Native `<dialog>` plus floating-ui, or Radix | **Radix Primitives 1.x** for Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Tabs, Select, Switch, Checkbox, RadioGroup and Slot. They ship **only in app shells and hydrated islands**. Marketing pages without JS use `<details>` and native elements. |
| Palette, toasts | None, or cmdk plus sonner | **Adopted, but only in app shells**: portal, Ops, Quorum, admin. |
| Motion library | motion 12 or 13 | **motion 13.x** (13.4.4 on the registry). Two tiers: `motion-lite` for SSG, `motion/react` for apps. No GSAP, no Lottie. |
| React | 19.2 or 19.3 | **react and react-dom 19.3.x** (checked on the registry). R3F 9.8.x requires React 19. |
| lowPower() thresholds | ≤4, <4 or ≤2 | **Keep what 07-motion.js already does**: Save-Data, `deviceMemory < 4`, `hardwareConcurrency < 4`, or effective type 2g. |
| Minimum width for 3D | 768 or 980 | **980px for heroes**, the portal's existing gate. Small below-the-fold, empty-state or 404 scenes (≤60KB chunk) may go down to 768. Below that, only the poster shows. |
| Fleet light theme | New opt-in theme, or none | **Deferred, not in v1.** Light is allowed only for `wmh-portal` and the client brands. |
| Ops font | Geist exception, or Inter | **Default is Inter**, for one fleet type system. This needs owner sign-off (§0.3). |
| Draw-call and triangle budgets | 40, 60 or 200 draw calls; 40k, 50k or 150k triangles | Marketing: **≤60 draw calls and ≤50k triangles** (≤15k on the low tier). App or Quorum: ≤200 draw calls. |
| 3D chunk budget | 230, 250 or 260KB | **≤250KB gz**, never modulepreloaded. |
| Hiding reveals when there is no JS | html.js class, `@media (scripting)` plus a failsafe, or html.tc-motion | **All of them:** content hides only under `html.ui-motion` *and* `(scripting: enabled) and (prefers-reduced-motion: no-preference)` *and* not `[data-motion=paused]`. A 2.5s CSS failsafe reveal covers the case where JS never arrives. |
| `hydrateRoot` on WMH marketing | Switch now, or wait | This **reopens the 2026-07-11 decision** (MASTER-PLAN §3.5). Until the owner confirms, the landed prerender keeps its snapshot plus `createRoot` replace. |
| Enforcing 3D bans | Review, or lint | **Lint** (`no-restricted-imports`) **plus review plus a runtime guard** (§6.4). |

### 0.3 Owner decisions (defaults apply if nobody decides)
1. Make `Beauwilliams32/trident-ui` public under MIT. Default: yes.
2. Ops moves from Geist to Inter. Default: yes.
3. Move WMH, Corner Bar and Filippa from Google Fonts to self-hosted fonts. Default: yes. All are OFL; Futura stays a `local()` hint only.
4. Corner Bar and Kula accept a **build step** and an output directory (`dist/`), with zero React at runtime by default. Default: yes.
5. WMH marketing moves to `hydrateRoot`. Default: **no**, until confirmed.
6. Playbook lockup reads "Trident Studio" instead of "by Trident Social". Default: Trident Studio.
7. Filippa gets no WebGL. Default: none.

---

## 1. Packaging

- **Repo:** `Beauwilliams32/trident-ui`. The superproject ignores it, as it ignores `trident-social`. Public, MIT.
- **Build:** Vite 8 library mode plus tsup, producing ESM and `.d.ts`. `sideEffects: ["*.css"]`. No CSS-in-JS runtime.
- **Install:** `"@trident/ui": "github:Beauwilliams32/trident-ui#v0.x.y"`. `dist/` is committed on the tag, and there is no `prepare` script, so an install is just a tarball fetch.
- **Releases** are tagged only from CI or a clean `main`. A `dist-matches-source` check (rebuild, then diff) blocks the tag. Changes are recorded with Changesets.
  - Any change that affects contrast is a **major** bump.
  - A new theme is minor.
  - Any change to rendered colour needs a CHANGELOG entry.

### Subpath exports
| Export | Contents |
|---|---|
| `@trident/ui/tokens.css` | Primitive and semantic variables. Zero JS. |
| `@trident/ui/themes/<name>.css` | One theme per brand, ≤12KB gz each (target about 1KB). |
| `@trident/ui/tokens.json`, `/tokens.mjs`, `/three.mjs` | JS tokens, plus **generated** three.js hex ints. Generated three.js ints replace Quorum's hand-kept FALLBACK map; its test keeps asserting that the two are equal. |
| `@trident/ui/styles.css` | Component classes, ≤25KB gz. |
| `@trident/ui` | React components. React 19 is a peer dependency. |
| `@trident/ui/server` | `SeoHead`, JSON-LD builders, `renderPage()`, `Island`. |
| `@trident/ui/islands` | `hydrateIslands()`, about 2KB gz. |
| `@trident/ui/motion-lite` | A port of 07-motion.js, about 2KB gz, with no library. |
| `@trident/ui/motion` | Wrappers over motion/react 13. |
| `@trident/ui/app` | Radix, cmdk and sonner compositions (apps only). |
| `@trident/ui/three` | R3F primitives. three, R3F and drei are **optional** peer dependencies. |
| `@trident/ui/fonts/*` | Self-hosted variable woff2 files. |
| `bin trident-ui` | `copy-assets <dir>` (fonts and posters into the Cloudflare assets directory), `poster` (local Playwright/SwiftShader render), `sync-tokens` (for projects not yet migrated). |

### Consumption per platform
- **Cloudflare Workers repos:** build locally, then `npm run deploy` as today.
- **Filippa (Vercel):** keep `framework: null`, `buildCommand: null`, `outputDirectory: public`. `deploy-vercel.mjs` git-archives the public/ directory that was built beforehand, so Vercel never installs anything.
- **Kula (Netlify):** anonymous install from the public repo.
- **Quorum:** commit the Vite output to `public/app/` and add it to the `build-open-core.mjs` allow-list. A staleness test compares the output against a hash of its source. Pro code stays on the server.
- **Tauri Mac app (Tools):** keeps copying `public/tools` and `public/assets`. The existing byte-identical test catches drift. The download Worker is never redeployed as part of UI work.
- **Drift control:**
  - Each repo has a `DESIGN-VERSION` file, and a test checks that the tag resolved in `package-lock.json` matches it.
  - The workspace-level pin report is [`docs/CONSUMERS.md`](CONSUMERS.md) (audited 2026-10-27). It replaced a
    planned `scripts/ui-version-report.mjs`, which was never written: most consumers do not pin a tag at all
    (they vendor or inline the canonical CSS, or carry their own tokens), so the report records the
    mechanism per repo instead of pretending every one has a tag to compare.
  - While repos migrate, projects not yet on React use `sync-tokens` plus a hash test, following the pattern in `test/motion-system.test.js`.
- **Rejected:**
  - Private GitHub Packages: it needs auth on Netlify, for Quorum buyers and in open-core.
  - Vendored tarballs: they repeat the drift that trident-glass.css copies already cause, and add repo weight.
  - A monorepo: the repos are independent, each with its own Definition of Done and deploy path.

---

## 2. Tokens

### 2.1 Architecture
- **Three layers:** primitives (`--p-*` ramps), then semantic (`--ui-*`, the only layer components read), then component tokens (`--ui-btn-h` and similar). Themes override the semantic layer only.
- **Selection:** the server sets `<html data-theme="<brand>" data-scheme="dark|light">`, so there is no flash of the wrong theme and no JS provider is needed for colour.
- **Per-client portal palettes:** `[data-portal-palette]` keeps `WMH.applyPortalTheme` working.
- **Legacy aliases:** `themes/legacy-aliases.css` maps `--tg-*`, `--violet-*`, `--glass-*`, `--dur-*`, and Ops' `--primary` and `--bg-card`. Each repo deletes its aliases once its CSS is ported.
- **`tokens.json` is the single source.** It generates tokens.css, tokens.mjs and three.mjs.

### 2.2 Semantic roles
- **Backgrounds and surfaces:** `--ui-bg`, `--ui-bg-2`, `--ui-surface`, `--ui-surface-raised`, `--ui-glass`, `--ui-glass-strong`, `--ui-glass-edge`, `--ui-specular`.
- **Lines:** `--ui-line`, `--ui-line-strong`.
- **Ink:** `--ui-ink`, `--ui-ink-2`, `--ui-muted`.
- **Accent:**
  - `--ui-accent-1`, `--ui-accent-2`, `--ui-accent-grad`, `--ui-glow`.
  - `--ui-on-accent`: ink placed on an accent fill.
  - `--ui-accent-text`: the accent used *as text*, guaranteed ≥4.5:1 on `--ui-bg` and `--ui-surface`.
- **Focus:** `--ui-focus`.
- **Status:** `--ui-ok`, `--ui-warn`, `--ui-danger`, `--ui-info`. Quorum's status meanings become shared across the portfolio as `--ui-status-live`, `--ui-status-attention`, `--ui-status-ok`, `--ui-status-error` and `--ui-status-reasoning`.
- **Type:** `--ui-font-display`, `--ui-font-body`, `--ui-font-mono`.
- **Radius:** `--ui-r-xs`, `--ui-r-sm`, `--ui-r`, `--ui-r-lg`, `--ui-r-pill`.

### 2.3 Runtime contrast
`ensureContrast(hex, bg)` takes any accent a tenant or client supplied (Ops `tenant.branding.primary_color`, default #6366f1; WMH `portalTheme` per-client accents). It then:
- picks `--ui-on-accent` as #0b1220 or #ffffff, whichever contrasts more;
- derives an `accent-text` shade that reaches ≥4.5:1;
- clamps any fill that falls below 3:1 against the background.

---

## 3. Themes (values)

### Fleet, dark (from trident-glass.css)
| Role | Value |
|---|---|
| bg / bg-2 | #070d16 / #0b1422 |
| surface (solid rows and tables) | #0e1a2b |
| glass / glass-strong | color-mix(#0e1a2b 62%, transparent) / color-mix(#0e1a2b 82%, transparent) |
| glass-edge / specular | rgba(255,255,255,.08) / rgba(255,255,255,.13) |
| line | rgba(148,199,255,.12) |
| ink / ink-2 / muted | #e9f2fb / #b7c7d8 / #8fa5bc |
| on-accent | #06121d |
| ok / warn / danger / info | #34d399 / #fbbf24 / #f87171 / #7dd3fc (each ≥4.5:1 on #0b1422) |

**Accent pairs.** `accent-text` is the first colour of each pair unless a test fails.

| Theme | Accent pair |
|---|---|
| `trident-studio` (hub) | #2dd4bf → #38bdf8 |
| `trident-nil` | #fbbf24 → #f97316 |
| `trident-ops` | #34d399 → #10b981 |
| `trident-playbook` | #a78bfa → #818cf8 |
| `trident-tools` | #0ea5e9 → #6366f1 |
| `trident-agents` | #d946ef → #8b5cf6 |

**Identity** uses the hub tokens and no accent.

### Williams Media
- **`wmh-portal` (light):**
  - Field #f7f9fd; cards #ffffff; ink #0b1220.
  - Accent-1 #7c3aed with its 50–700 ramp; about 5.6:1 on white, so it passes. Accent-2 #2563eb.
  - Elevation e2: `0 18px 48px rgba(15,23,42,.09), 0 2px 10px rgba(15,23,42,.05)`.
  - Liquid-glass blur 18px and 28px.
- **`wmh-marketing` (dark):**
  - Void #04040a; night-900 #060e1a.
  - `accent-text` is **violet-300 #b69bff**, because #7c3aed reaches only about 3.3:1 on dark.
  - Gold #e8b84a and #c9a84c for eyebrows only.
  - Logo gradient #5d0045 → #210018.
- **`wmh-dark`:** the portal's dark theme, plus per-client admin accents from `bootstrap.portalTheme`, passed through `ensureContrast`.

### Portfolio and Quorum (shipped in the package)
- **`portfolio`:**
  - bg #0d0a0a, bg-2 #151010, card #191313.
  - ink #f4eee9, muted #a89a93.
  - accent #e34c4c / #b93a3a; glow rgba(227,76,76,.32).
  - Accent as text is allowed only at ≥15px semibold.
  - Radius 14px.
  - Runtime `site.accent` override, passed through `ensureContrast`.
- **`quorum`:**
  - bg #0b0f14, bg0 #070a0e, fg0 #e8f0f6, muted #7e909f.
  - accent (LIVE) #3fd0e0, warn (ATTENTION) #f2b544, ok #46d6a0.
  - A `--q-*` → `--ui-*` map keeps `theme.js` names working.

### Client themes (in the client repos, built on the token contract)
- **Kula (light):**
  - ink #17193A, paper #FBF9F5, rule #E4DFD4, muted #5F627F.
  - jade #17715B, rust #A83E2B.
  - **Saffron #EFA31D is a fill only, never text** (about 2:1). `accent-text` is jade or ink.
  - Belt ramp: #FFF, #F5C542, #E8842C, #2E8B57, #2B6CB0, #6B4E9B, #7A5236, #17193A.
  - Radius 14/8; max width 1140px.
- **Corner Bar (dark):**
  - ink #12181B, #192126, #223037; chalk #EDE9DF.
  - amber #F5B331 is the CTA, with ink text on amber.
  - petrol #2F7268, cold #8FD3DE.
  - rust #C24E33 for errors and the stamp only.
- **Filippa (light):**
  - ink #0f0f0f, paper #fff, paper-2 #f5f4f1, gray #757572 (AA), line rgba(0,0,0,.13).
  - No accent hue: accent-1 is the ink.
  - Max width 1180px.

---

## 4. Typography

All fonts are self-hosted variable woff2 (latin and latin-ext) with metric-matched fallback `@font-face` rules. Each page preloads at most 2 font files. There are no Google Fonts connections.

| Brand | Display | Body | Mono |
|---|---|---|---|
| Fleet (including Ops by default) | Space Grotesk | Inter | JetBrains Mono (tabular data, prices, IDs) |
| WMH | `local(Futura)`, then Manrope 700–800 | Manrope | JetBrains Mono |
| Portfolio | Oswald | Inter | none |
| Kula | Bricolage Grotesque | Newsreader | DM Mono |
| Corner Bar | Staatliches | Barlow | Space Mono (exactly three families) |
| Filippa | Cormorant Garamond | Hanken Grotesk | none |
| Quorum | System SF stack | System SF stack | SF Mono (no webfonts) |

**Scale.** Root is 16px. Sizes are fluid: ratio 1.25 on mobile, 1.333 on desktop.

| Step | Size |
|---|---|
| 2xs | 12 |
| xs | 13 |
| sm | 14 |
| base | 16 (line-height 1.6) |
| md | 18 |
| lg | 20 |
| xl | clamp(22px, 2vw, 24px) |
| 2xl | clamp(26px, 3vw, 30px) |
| 3xl | clamp(30px, 4vw, 38px) |
| 4xl | clamp(36px, 5.5vw, 48px) |
| display | clamp(40px, 6vw, 76px) (line-height 1.02) |

- **Display text:** 600 weight, tracking -0.022em.
- **Kicker:** 12px, 600 weight, +0.14em, uppercase.
- **Body:** at least 16px, lines capped at 68ch.
- **Numerals:** `tabular-nums` in tables and stats.
- **GradText:** at most 1–2 words.

---

## 5. Spacing, radius, elevation, grid

- **Spacing:** 4px base. Steps: 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.
- **Radius:**
  - xs 6 (chips, kbd), sm 10 (inputs, buttons), md 16 (cards), lg 22 (hero panels), pill 999.
  - Overrides: portfolio 14; Kula 14/8.
- **Elevation, light:**
  - e0: none.
  - e1: `0 1px 2px rgba(15,23,42,.06), 0 0 0 1px var(--ui-line)`.
  - e2: the portal's glass shadow.
  - e3: hover.
  - e4: overlays.
- **Elevation, dark:**
  - e1: glass with `blur(14px) saturate(140%)`, a 1px specular top edge and a glass-edge ring.
  - e2: glass-strong plus `0 16px 40px -16px rgba(0,0,0,.55)`.
  - e3: overlays on a solid surface, no blur.
- **Grid:**
  - 12 columns.
  - Content width: marketing 1080px, app shell 1280px.
  - Gutter clamp(16px, 4vw, 32px), with at least 16px padding at phone width.
  - Breakpoints: 480, 768, 1024, 1280. The 3D gate is 980.
- **Blur budget:** `backdrop-filter` on the nav plus at most 6 elements per viewport. Never on list rows or tables. A lint counts blur classes in the gallery snapshots.

---

## 6. Motion and 3D

### 6.1 Tiers
1. **`motion-lite`** (SSG and marketing, about 2KB, no library). A port of 07-motion.js:
   - `reduced()` and `lowPower()`.
   - `[data-reveal]` via IntersectionObserver, with `--i` stagger.
   - `countUp`, with an `isCountable` guard so dates and phone numbers stay static.
   - `Tilt`, fine pointer only.
   - `startViewTransition` for route and tab changes.
2. **`motion`** (apps only), using motion/react 13:
   - `<LazyMotion features={domAnimation} strict>` with `m.*` components, about 15KB gz.
   - `domMax` only where layout animation or drag is needed (Ops widgets, the portal board, Quorum).
   - `<MotionConfig reducedMotion="user">` at the root.
3. **3D** uses R3F `useFrame` only. There is one animation engine per tier: no GSAP, no Lottie.

### 6.2 Tokens
Every value is also exported as a JS constant, so R3F damping reads the same numbers.

**Durations**

| Token | Value | Use |
|---|---|---|
| `--ui-dur-instant` | 80ms | |
| `--ui-dur-fast` | 160ms | hover and focus |
| `--ui-dur-mobile-fast` | 160ms | mobile control feedback |
| `--ui-dur-mobile-base` | 240ms | mobile state transitions |
| `--ui-dur-mobile-slow` | 320ms | mobile cards and sheets |
| `--ui-dur` | 200ms | controls |
| `--ui-dur-page` | 260ms | routes and tabs |
| `--ui-dur-med` | 320ms | cards and sheets |
| `--ui-dur-slow` | 480ms | large dialogs |
| `--ui-dur-reveal` | 600ms | |
| `--ui-dur-count` | 1100ms | |

**Easings**

| Token | Value | Notes |
|---|---|---|
| `--ui-ease` | cubic-bezier(.2,.8,.2,1) | |
| `--ui-ease-emph` | cubic-bezier(.2,0,0,1) | |
| `--ui-ease-exit` | cubic-bezier(.4,0,1,1) | |
| `--ui-ease-inout` | cubic-bezier(.4,0,.2,1) | |
| `--ui-spring` | cubic-bezier(.22,1.2,.36,1) | |
| `--ui-spring-pop` | cubic-bezier(.34,1.4,.64,1) | WMH toasts |

**JS springs**

| Preset | Values | Use |
|---|---|---|
| `snappy` | stiffness 520, damping 38, mass .8 | toggles, menus |
| `smooth` | stiffness 300, damping 34 | sheets, dialogs |
| `gentle` | stiffness 160, damping 26 | hero text only |

**Distances**
- Reveal distance 18px.
- Stagger 70ms × `--i`, capped at 6 items.
- Tilt at most 7deg.
- Lift -3px.

### 6.3 Rules
1. **Animate only transform and opacity.** Exceptions: shader uniforms inside a canvas, View Transitions, and a GPU-safe clip-path reveal.
2. **Exits run at about 0.7× the length of the enter.** UI feedback takes 160–320ms; only reveals and count-ups run longer.
3. **No scroll-jacking and no page parallax.** Inside a decorative canvas, the camera may follow the pointer or scroll progress, capped at ±4° and 0.15 units.
4. **Money, auth and compliance paths** get only state feedback: press, focus, a 160ms fade, a spinner, a success tick. The one exception is the Corner Bar stamp "thud", which fires once *after the server confirms*.
5. **Ambient loops that run longer than 5s** (ambient glow, orbit, marquee, TV-wall sweep, lamp pulse) must be pausable. A persistent **"Pause motion"** control sits in the footer or nav and sets `html[data-motion="paused"]`. The value is stored in localStorage inside try/catch.
6. **No more than 3 flashes per second.** The stamp and count-ups run once.
7. **Skeleton shimmer lasts at most 1s**, then turns static.
8. **Focus rings are never animated away.**
9. **Honesty:**
   - Count-ups and "live" indicators animate only to values an API or props actually supplied.
   - A hero platform card is lit only when `/api/public/platform-status` returns `live:true`.
   - No fake dashboards, counters or live nodes.
10. **No-JS guarantee:** the SSR state is the final state. The hiding rule is in §0.2 and the failsafe animation is `ui-reveal-failsafe 0s 2.5s forwards`.

### 6.4 Reduced motion and low power
When `prefers-reduced-motion: reduce` is set, or motion is paused:
- Movement becomes an instant change, or an opacity cross-fade of at most 150ms.
- Reveals appear immediately.
- CountUp renders the final value.
- Marquees become a static list.
- View Transitions are skipped.
- Ambient effects are static.
- **3D never creates a WebGL context**; only the poster shows.

These are backed by three gates:
- `MotionConfig`.
- A global CSS kill switch (0.01ms durations). This is the only place `!important` is allowed.
- `useQualityTier() === 'off'`.

`lowPower()` applies the 3D rule too, but keeps micro-transitions.

### 6.5 3D stack and primitives
**Stack:**
- three 0.180.0 (see §0.2).
- @react-three/fiber 9.8.x.
- drei 10.x, imported by name from an allow-list: PerformanceMonitor, AdaptiveDpr, Instances/Merged, Float, RoundedBox, useTexture.
- Any other drei import needs a size-limit bump approved in review.
- No postprocessing, except subtle bloom in the Quorum cockpit.
- **Banned** because of CSP (`script-src 'self'`, no wasm-unsafe-eval) or weight:
  - Draco, KTX2 and meshopt decoders.
  - drei `<Text>`/troika (it uses a blob worker).
  - MeshTransmissionMaterial.
  - HDRI and remote environment files.
- **Assets:** procedural or owned only:
  - showcase-media AVIF;
  - portfolio showreel posters and frames;
  - Quorum atlas webp;
  - logo SVG paths.
- No cloud generative media. Everything is bundled from the same origin.

**Primitives in `@trident/ui/three`:**
- **`<Lazy3D scene={() => import(...)} poster minWidth={980}>`** is the **only** way to mount a canvas. It mounts only when all of these hold:
  - after `load` plus `requestIdleCallback`;
  - the element is intersecting and the document is visible;
  - WebGL2 is available;
  - `useQualityTier() !== 'off'`;
  - no form field on the page has focus.

  Otherwise the poster, painted first, stays. The container has a fixed aspect ratio, so CLS is 0. The canvas is `aria-hidden`, `tabIndex=-1` and `pointer-events: none` unless the scene is interactive.
- **`<SceneCanvas>`:**
  - dpr [1, 1.5], and 1 on coarse pointers.
  - `antialias: false`, `powerPreference: 'low-power'`, `alpha: true`.
  - frameloop is `never` when off-screen or hidden, `demand` after 8s idle, and stops on Pause.
  - PerformanceMonitor steps down dpr, then particles, then swaps to the poster below 40fps for 3s.
  - A `webglcontextlost` handler and an ErrorBoundary fall back to the poster.
  - Disposes on unmount.
  - The scene is built in `requestIdleCallback` slices, so no long task exceeds 50ms.
- **`useQualityTier()`** returns `off`, `low` or `high`, based on reduced motion, lowPower, viewport width, PerformanceMonitor and the Pause state.
- **`useTokenColor()` / `useBrandColors()`** read `tokens/three.mjs` at runtime, falling back to generated values.
- **Other primitives:**
  - `<FresnelCore>` and `<OrbitRing>`: ports of hero-3d.js.
  - `<StatusOrbit items>`: lit only on `live:true`. A unit test pins that the fallback list never lights anything. It also renders a visually hidden list in the DOM.
  - `<GlassPanel>`: fresnel plus specular plus tinted alpha, as a custom shader.
  - `<LabelPlane>`: canvas-texture text, with the same text also in the DOM.
  - `<AmbientField>`: at most 2,000 instanced points.
  - `<SvgExtrude>`.
  - `<MediaPlane>` / `<VideoPlane>`: owned muted mp4 that plays only while in view.
  - `<InstancedCity>`: wraps Quorum's city.js unchanged first, then gets a declarative port.
  - `<PosterFallback>`.
- **Posters** are rendered **locally** at build time with `trident-ui poster` (Playwright plus SwiftShader, fixed seed, AVIF/WebP output). The poster doubles as the mobile experience.

### 6.6 Budgets for 3D
| Item | Marketing | App (Quorum Deck) |
|---|---|---|
| Lazy chunk | ≤250KB gz (small scenes ≤60KB) | ≤250KB gz |
| Draw calls | ≤60 | ≤200 |
| Triangles | ≤50k desktop, ≤15k low tier | measured |
| Textures | ≤4 at ≤1024², ≤24MB GPU, ≤400KB transfer | same |
| Lights, shadows | 1 key light plus procedural environment, no shadows | BEACON_BUDGET = 6; shadows on desktop only, never when lowPower |
| Frame rate | 60fps on M1 | same |

A Playwright check reads `renderer.info` after 60 frames and fails if any budget is exceeded.

### 6.7 Signature scene per product
Each scene is decorative, sits beside or behind a **text H1**, and is never the LCP element.

| Product | Scene |
|---|---|
| WMH | R3F port of hero-3d (StatusOrbit, honesty-gated). The `old-aggie-open.avif` LCP preload stays. |
| Studio hub | Extruded glass trident mark, teal/cyan fresnel. |
| Ops | Emerald instanced node lattice. Decorative; implies no live metrics unless it is fed real tenant data. |
| NIL | Gold/amber faceted crest. |
| Playbook | Stacked page slabs; the slab count comes from `PLAYBOOKS.length`. |
| Tools | Sky/indigo precision grid with a ruler sweep. |
| Portfolio | Curved reel of owned showreel poster frames. |
| Kula | Belt-rank ribbon spline **beside** CampusFinder, never replacing it. |
| Corner Bar | Enamel sign plate or 10-screen TV wall, below the fold, idle-loaded, outside the 100KB first-load cap, never competing with the ReservationTicket. |
| Filippa | **No WebGL.** Motion tokens and a CSS photo drift only. |
| Quorum | City scene with shadows, raycast selection and orbit drag, **plus keyboard and button orbit and a DOM building list** (WCAG 2.5.7). |
| Identity | None. |

**Also allowed:** 404 pages. In app surfaces, **only empty states and success moments**: at most 60KB, demand loop, stops after 3s.

### 6.8 Where 3D and ambient loops are forbidden
**Surfaces:**
- **Money:** checkout, billing, pricing tables (the price text), Stripe return pages, escrow, refunds, payouts, Ops BillingPage, portal payments.
- **Auth:** login, signup, OAuth, and Trident Identity.
- **Compliance and legal:** consent, privacy, terms, data-deletion, NIL contracts.
- **Other:** admin tables and forms, any form, any page while a field has focus, the LCP path, email, OG and print output, and any 3D that carries information not also in the DOM.

**Enforcement:**
- ESLint `no-restricted-imports` blocks `@trident/ui/three` and `@trident/ui/motion` in each repo's money, auth and legal directories.
- `<Lazy3D>` refuses to mount under `[data-surface="money|auth|legal|admin"]`.
- A review checklist item.

---

## 7. Component inventory

**Priority levels:** P0 is needed by the first adopter, P1 by the second wave, P2 comes later.

| Pri | Component | Notes |
|---|---|---|
| P0 | Tokens, themes, fonts, legacy aliases | Zero JS. |
| P0 | ThemeProvider | Exposes tokens to three.js only. Theme selection itself happens on the server. |
| P0 | SkipLink, VisuallyHidden, LiveAnnouncer, FocusRing | 2px `--ui-focus` plus 2px offset, ≥3:1, forced-colors support. |
| P0 | Container, Stack, Cluster, Grid, Section | |
| P0 | Heading, Text, Kicker, GradText, Mono, Code, Kbd, Prose | Heading requires a level; dev mode warns on a second h1 or a skipped level. |
| P0 | Button, LinkButton, IconButton | Primary, secondary-glass, ghost, danger, link. Sizes 32/36/44. Loading state keeps the width. A native `<button type=submit>` works without JS. IconButton requires `aria-label`. Icons from lucide-react, replacing Ops' emoji and Unicode glyphs. |
| P0 | Form, CsrfField, Field, Input, Textarea, Select, Checkbox, Radio, Switch, FormError, SubmitButton, ErrorSummary | Native POST first. The CSRF value is passed in from the server. SubmitButton re-enables on `pageshow`. Select is native on mobile, Radix on desktop app surfaces. |
| P0 | Badge, StatusPill, Chip, Avatar | Always text plus colour; contrast-tested. |
| P0 | Card (solid, glass, interactive), StatCard | Specular sweep and tilt behind the motion gate. StatCard shows real values only, and SSR renders the final value. |
| P0 | Alert, FlashBanner, Toast | Toast uses sonner 2.x in apps and a CSS toast in islands. FlashBanner maps `nil_flash` and portal toasts. role=status, or role=alert for errors. |
| P0 | SeoHead, jsonLd builders, renderPage, Island, hydrateIslands | Island props go in `<script type="application/json">`, which the CSP allows. |
| P0 | Reveal, CountUp, Tilt, ViewTransitionLink, AmbientGlow (CSS), **MotionToggle** | |
| P1 | SiteHeader/MarketingNav, Footer (includes MotionToggle), Breadcrumbs (plus JSON-LD), Tabs, Pagination, Stepper | Mobile disclosure with Escape, focus return and `scroll-padding-top`. |
| P1 | AppShell, SideNav/SideNavItem, TopBar, PageHeader | Collapses to a drawer below 1024px. |
| P1 | Radix overlays: Dialog, Sheet, Popover, Tooltip, DropdownMenu, ContextMenu, **AlertDialog/ConfirmDialog** | ConfirmDialog replaces `confirm()` on the NIL refund; the server check stays authoritative. Tooltip meets WCAG 1.4.13. |
| P1 | **CommandPalette** (cmdk 1.x) | Portal, Ops, Quorum, admin. |
| P1 | DataTable, DescriptionList/KeyValue, EmptyState, Skeleton, ProgressBar, Meter, Sparkline, Timeline | DataTable: solid rows, sticky header, sortable header buttons, scrolls inside its own container, virtualised only above 200 rows. |
| P1 | Hero, FeatureGrid, CtaBand, FAQ, PricingTable, LogoWall, CaseStudyCard, ShowcaseMedia, Testimonial, LegalDoc | Hero requires a text H1 and has slots for Lazy3D and an LCP image (`fetchpriority=high`). FAQ uses `<details>` plus FAQPage JSON-LD. PricingTable takes prices only from props or the pricing canon and renders Stripe links in static markup. Testimonial uses real quotes only, with no aggregateRating. LegalDoc renders with no script. |
| P1 | BrandLockup, TridentMark, BrandMark SVGs | "Trident Studio" kicker. |
| P1 | Lazy3D, SceneCanvas, PosterFallback, useQualityTier, useTokenColor | |
| P2 | FresnelCore, OrbitRing, StatusOrbit, GlassPanel, LabelPlane, AmbientField, SvgExtrude, MediaPlane, InstancedCity; signature scenes | |
| P2 | Marquee | Pauses on hover and under reduced motion or Pause. |
| P2 | Combobox, SegmentedControl, RadioGroup | Athlete and school search. |
| P2 | Utilities: `ensureContrast`, `formatMoney`, `formatDate` | Portal tz conversion stays in 05-schedule-time. |

**Components that stay in their own repos:**
- Kula: BeltRail, CampusFinder.
- Corner Bar: ReservationTicket plus Stamp.
- Filippa: EditorialGallery (CSS grayscale, credit required).
- Portfolio: BlockRenderer (12 block types) and the admin-only inline editor.
- Quorum: Mascot, Character, CrewRow, Bubble.

**Compatibility:** the API names and props from the portal's `_ds_bundle.js` are kept, so the tab-*.js migrations are drop-in.

---

## 8. SSR strategy by surface kind

**Common to every surface:**
- React 19.3; Vite 8 with `@vitejs/plugin-react`.
- Build time: `react-dom/static` `prerender()` or `renderToString`.
- Workers: `renderToReadableStream` from `react-dom/server.edge`, **awaiting `allReady` on SEO routes** so status and head are final.
- Client: `hydrateRoot`, with `onRecoverableError` wired to fail tests.
- Dates, timezones and live status reach the page only as props.

| Surface kind | Strategy |
|---|---|
| **Public marketing, static** (hub, Tools, Kula, Corner Bar, Filippa, Ops landing) | SSG to `folder/index.html`, matching each host's trailing-slash handling. **Zero React at runtime by default**; islands only where needed (about 60KB React chunk loaded on idle or interaction, or 1–3KB vanilla islands). |
| **Public, dynamic** (NIL /, /athletes, /deals and their detail pages; portfolio from D1) | Worker SSR on Hono or Worker; islands only. `export default { fetch }` is unchanged. |
| **Playbook** | SSG from content.js. The Worker keeps robots, sitemap, feed and og.png. |
| **Legal** | `renderToStaticMarkup`, **zero `<script>`**. Real content returns 200. |
| **Auth** | SSR, native POST with server CSRF, then redirect. noindex and no-store. Hydration adds only inline validation. No 3D. |
| **Money and compliance** | Server-authoritative SSR plus native POST, then redirect plus flash. Hydration adds only validation and ConfirmDialog. Webhooks and escrow are untouched. |
| **App** (portal SPA, Ops app, Quorum) | CSR SPA inside an SSR shell. noindex. Code-split routes. |
| **Admin** | CSR, noindex, no 3D. |
| **Identity** | No React. Add `X-Robots-Tag: noindex` and a disallow-all robots.txt. JSON contracts unchanged. |

**Per repo:**
- **WMH portal:**
  1. Land the prerender worktree as-is and adopt its output contract.
  2. Add Vite: `src/client/main.jsx` builds to `src/public/build/` (later `/b/<buildId>/`), with hashed same-origin files so the CSP is unchanged.
  3. A shim sets `window.React`, `window.ReactDOM` and `window.htm` from the bundled React 19, so the IIFEs and the 18 tab modules share one instance while tabs migrate one at a time.
  4. Before the swap, grep for `ReactDOM.render`, string refs and `defaultProps`.
  5. Delete the 18.3.1 UMD last.
  6. The HTMLRewriter keeps rewriting the head and stripping `data-surface` groups.
  7. `hydrateRoot` waits on owner decision 0.3-5.
- **Ops:** keep the Vite SPA. Prerender LandingScreen into `dist/index.html`, then hydrate when signed out. Add React Router 7 data mode. Each public route needs a Worker route, a sitemap entry and a test (there is no SPA fallback). Legal-pages tests are unchanged.
- **NIL:** pages.js page*() functions become components rendered by `renderPage()`. Islands (mobile nav, school picker, role toggle, refund confirm) build with esbuild into `public/islands/`. Only after PR #13 merges.
- **Portfolio:** SSR puts body copy in the first byte. `seoForPath` becomes one module shared by server and client. The editor is an admin-only island loaded after authentication.
- **Hub, Tools, Corner Bar:** commit the generated HTML, with a `--check` staleness gate. Corner Bar's publish directory moves from `.` to `dist/`, copying `_headers`, `_redirects`, robots, sitemap and manifest through. Tools gets re-synced to the Mac app.
- **Kula:** `dist/` on Netlify, unchanged. The Wix `_redirects` map stays byte-stable.
- **Filippa:** build locally into `public/`. Base64 data URIs move to `public/images/`, shrinking the current 943KB page. The image optimizer's PHOTOS and SETS parse must still pass.
- **Quorum:** CSR, committed to `public/app/`. three moves from the VENDOR map into the bundle. The node-pty and xterm vendor map stays.

---

## 9. Accessibility and performance budgets

### Accessibility (WCAG 2.2 AA)
- **Contrast:** a token test covers every pair in every theme and scheme:
  - ink and muted on bg/surface: ≥4.5:1;
  - accent-text: ≥4.5:1;
  - on-accent on accent: ≥4.5:1;
  - focus and line-strong: ≥3:1.

  `ensureContrast` handles runtime accents. Pairs already tuned are kept (NIL status-closed 6.95:1, Ops' #6b7280 replacement).
- **Focus:** always visible, never removed. Not hidden by the sticky nav (2.4.11), via `scroll-padding-top`.
- **Target size:** at least 24×24 (2.5.8), and 44px for actions on touch. Use the `ui-btn--game-control` modifier for a visible 48px game control; keep game labels, HUDs and input methods specific to each title.
- **Dragging:** every drag has an alternative (2.5.7).
- **Keyboard:** Radix and cmdk handle keyboard paths. Escape closes overlays and returns focus.
- **Structure:** one h1 per page, no skipped levels, a skip link, landmarks, `lang`, and alt text on every image.
- **Live regions** for toasts and flash messages. Error summaries link to their fields. No form timeouts.
- **Motion and 3D:** Pause motion (2.2.2). Reduced motion is honoured three ways. 3D is `aria-hidden`, with DOM equivalents for anything it shows.

### Performance
Mobile preset, local Lighthouse CI, and size-limit in each repo's `npm run check`. CI fails on a bundle regression above 5%.

| Metric | Budget |
|---|---|
| LCP | ≤2.5s (≤2.0s target on marketing) |
| CLS | ≤0.05 |
| INP | ≤200ms |
| TBT | ≤200ms |
| Lighthouse | WMH mobile from 79 to ≥90; Kula, Corner Bar and hub ≥95; others ≥90 |
| Initial JS on static client sites and legal pages | 0KB (islands-only sites ≤25KB) |
| Initial JS on hydrated marketing | ≤60KB gz, plus about 2KB motion-lite |
| Corner Bar first load | ≤100KB total |
| App shell initial JS | ≤180KB gz, including the `react-vendor` chunk; route chunks ≤60KB |
| 3D | Never in the initial graph and never modulepreloaded; ≤250KB gz |
| CSS | Shared ≤25KB gz, plus ≤12KB theme; ≤30KB per page |
| Fonts | ≤2 preloads |
| Images | AVIF/WebP with dimensions; the LCP image is never lazy |
| Worker SSR | Bundle checked with `wrangler deploy --dry-run` in `check:release` |

---

## 10. Testing strategy

1. **Package unit tests:** Vitest 4, jsdom, @testing-library/react and vitest-axe, run on every component × every theme.
2. **Reduced motion:** a `matchMedia` stub, for both reduce and Pause, asserts that the final state renders and that no rAF or WebGL context starts.
3. **Token tests:**
   - contrast matrix;
   - generated `three.mjs` equals Quorum's FALLBACK map;
   - motion tokens match the `ds.css` inline copy;
   - `DESIGN-VERSION` matches the lockfile;
   - `dist` matches source on the tag.
4. **SSR and hydration parity** per SSR route: render on the server, `hydrateRoot` in jsdom, and fail on any recoverable error. This follows the pattern in `test/prerender-app-route-shell.test.js`.
5. **Form-contract snapshots:** before migration, snapshot every money, auth and compliance form's action, method, field names and CSRF field, then assert they are unchanged afterwards.
6. **Visual regression:**
   - A static **gallery page** built from the package covers every component × every theme × light/dark × reduced/pause, at 360px and 1280px.
   - Screenshots are taken with Playwright's `toHaveScreenshot` in local Chromium: fonts pinned, animations disabled, maxDiffPixelRatio 0.1%, baselines committed.
   - 3D is snapshotted **only through its poster**, rendered with a fixed seed on SwiftShader, so screenshots are deterministic.
   - Each repo adds key-route screenshots for marketing, auth, money and app.
   - Visual finals still go through the owner's creative review gate.
7. **axe:** `@axe-core/playwright` on the gallery and each repo's key routes, under both reduced-motion states and both widths.
8. **Keyboard journeys:** Playwright runs keyboard-only through login, pricing and checkout, the NIL deal flow, the portal composer and the Quorum city list.
9. **Perf:** size-limit; Lighthouse CI locally; the `renderer.info` budget test; a blur-count lint.
10. **Honesty tests:**
    - The StatusOrbit fallback list never lights anything.
    - CountUp targets come from props.
    - The Playbook slab count equals `PLAYBOOKS.length`.
11. **Coverage floor:**
    - Existing test counts may not drop: NIL 47 smoke and 266 node, Kula 106, Corner Bar 132, Filippa 116, hub about 219.
    - Harnesses that pull code out of inline scripts (Corner Bar `_harness.mjs`, Filippa `_dom.mjs`, portfolio app.js, Kula site-js) are **ported, not deleted**.
    - URL, sitemap and redirect byte-stability tests keep passing (Tools has 9 pages; NIL has 8 URLs).

No cloud services are used: everything runs locally or in the repo's CI.

---

## 11. Adoption order

Each step follows the workspace Definition of Done: merged to `main`, pushed, submodule pointer bumped, worktree removed. Each project deploys only from `main`, after its own gate passes. GitNexus impact analysis runs before shared portal changes.

| # | Project | Scope | Gate or dependency |
|---|---|---|---|
| 0 | trident-social DESIGN.md | Amendment (§0.1) plus owner decisions | Before any code |
| 0 | In-flight work | WMH prerender worktree, Ops PR #12, NIL PR #13, Filippa release | Must land first |
| 1 | **trident-ui v0.1** | Tokens, themes, fonts, styles, motion-lite, server/islands, P0 components, gallery with visual-regression, axe and contrast tests | Tag v0.1 |
| 2 | **Trident Ops** | Pilot for the React components (already Vite and React): AppShell, cmdk, sonner, Radix, router, prerendered landing, Inter | PR #12 merged |
| 3 | **Studio hub, then Tools** | SSG pilot, zero runtime React, signature scene, Tauri re-sync | Tools Mac byte-identical test |
| 4 | **Playbook** | SSG, subscribe island, slab scene, lockup fix | none |
| 5 | **Trident NIL** | Worker SSR components, islands, ConfirmDialog, form-contract snapshots | After PR #13 |
| 6 | **Williams Media Portal** | Marketing first, then login, then tab-by-tab strangler to React 19; R3F hero-3d once on React 19 | Prerender landed; `hydrateRoot` needs owner decision; creative review |
| 7 | **beau-portfolio** | Worker SSR from D1, shared seoForPath module, reel scene | none |
| 8 | **Quorum** | Vite CSR committed build, InstancedCity wrapper then declarative port, a11y alternatives | open-core allow-list; staleness test |
| 9 | **Kula, then Corner Bar, then Filippa** | SSG in source, client themes in their own repos, islands only | **No deploy, publish or DNS change without client and owner approval** |
| any | **Trident Identity** | noindex header plus robots.txt only | none |

Later: the fleet-wide bump from three 0.180 to 0.186, and fleet light theme v2 if the owner asks for it.
