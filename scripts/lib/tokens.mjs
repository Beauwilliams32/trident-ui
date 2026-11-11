/**
 * Pure functions over tokens.json. Shared by scripts/build-tokens.mjs (which writes dist/)
 * and the Vitest suites (which never need a build). No filesystem access here except loadTokens().
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const HEADER = '/* @trident/ui — GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit. */'

export function loadTokens(path = join(ROOT, 'tokens.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function expandHex(hex) {
  const body = hex.slice(1).toLowerCase()
  return body.length === 3 ? `#${[...body].map((c) => c + c).join('')}` : `#${body}`
}

export function hexToInt(hex) {
  return Number.parseInt(expandHex(hex).slice(1), 16)
}

function primitive(tokens, path) {
  let node = tokens.primitives
  for (const key of path.split('.')) {
    if (node == null || !(key in node)) throw new Error(`unknown primitive {p.${path}}`)
    node = node[key]
  }
  if (typeof node !== 'string') throw new Error(`primitive {p.${path}} is not a leaf`)
  return node
}

/** Resolve {role} and {p.x.y} references inside one role map. Cycles throw. */
export function resolveRoles(tokens, roles) {
  const out = {}
  const visiting = new Set()
  const resolve = (name) => {
    if (name in out) return out[name]
    if (!(name in roles)) throw new Error(`unknown role {${name}}`)
    if (visiting.has(name)) throw new Error(`reference cycle at {${name}}`)
    visiting.add(name)
    const value = String(roles[name]).replace(/\{([^}]+)\}/g, (_, ref) =>
      ref.startsWith('p.') ? primitive(tokens, ref.slice(2)) : resolve(ref),
    )
    visiting.delete(name)
    out[name] = value
    return value
  }
  for (const name of Object.keys(roles)) resolve(name)
  return out
}

/** Raw (unresolved) role map for a theme, with base inheritance and an optional palette applied. */
export function rawThemeRoles(tokens, name, palette) {
  const theme = tokens.themes[name]
  if (!theme) throw new Error(`unknown theme ${name}`)
  const base = theme.extends ? tokens.base[theme.extends] : null
  let roles = { ...(base ? base.roles : {}), ...theme.roles }
  if (palette) {
    const p = theme.palettes?.[palette]
    if (!p) throw new Error(`theme ${name} has no palette ${palette}`)
    roles = { ...roles, ...p }
  }
  return roles
}

export function themeScheme(tokens, name) {
  const theme = tokens.themes[name]
  return theme.scheme || tokens.base[theme.extends]?.scheme || 'dark'
}

/**
 * Extra variables a theme sets on top of its roles (`--ui-<key>`), inherited from its base like
 * roles are. A key that names a global token (for example `dur` or `text-base`) overrides it while
 * the theme is active, so a brand can re-point existing names instead of adding new ones.
 */
export function themeExtra(tokens, name) {
  const theme = tokens.themes[name]
  const base = theme.extends ? tokens.base[theme.extends] : null
  return { ...(base?.extra || {}), ...(theme.extra || {}) }
}

/** The scheme's elevation scale (e0 to e4) with any per-base or per-theme overrides applied. */
export function themeElevation(tokens, name) {
  const theme = tokens.themes[name]
  const base = theme.extends ? tokens.base[theme.extends] : null
  return { ...tokens.elevation[themeScheme(tokens, name)], ...(base?.elevation || {}), ...(theme.elevation || {}) }
}

/** Fully resolved semantic roles for a theme (+ optional data-portal-palette variant). */
export function resolveTheme(tokens, name, palette) {
  const roles = resolveRoles(tokens, rawThemeRoles(tokens, name, palette))
  for (const role of tokens.roles) {
    if (!(role in roles)) throw new Error(`theme ${name}${palette ? `/${palette}` : ''} is missing role ${role}`)
  }
  return roles
}

/** Every (theme, palette) variant the contrast matrix must cover. */
export function themeVariants(tokens) {
  const out = []
  for (const [name, theme] of Object.entries(tokens.themes)) {
    out.push({ theme: name, palette: undefined, id: name })
    for (const palette of Object.keys(theme.palettes || {})) out.push({ theme: name, palette, id: `${name}[${palette}]` })
  }
  return out
}

const DURATION_VAR = { base: '--ui-dur' }
export const durationVar = (key) => DURATION_VAR[key] || `--ui-dur-${key}`
const EASING_VAR = { ease: '--ui-ease', spring: '--ui-spring', 'spring-pop': '--ui-spring-pop' }
export const easingVar = (key) => EASING_VAR[key] || `--ui-ease-${key}`
export const bezier = (arr) => `cubic-bezier(${arr.map((n) => String(n).replace(/^0\./, '.')).join(',')})`

function decl(name, value) {
  return `  ${name}: ${value};`
}

/** Theme-independent variables: primitives, type, space, grid, motion, component tokens. */
export function globalDecls(tokens) {
  const p = tokens.primitives
  const lines = ['  /* primitives: colour ramps (--p-*) */']
  for (const [ramp, steps] of Object.entries(p.color)) {
    for (const [step, value] of Object.entries(steps)) lines.push(decl(`--p-${ramp}-${step}`, value))
  }
  lines.push('  /* primitives: font stacks */')
  for (const [k, v] of Object.entries(p['font-stack'])) lines.push(decl(`--p-font-${k}`, v))
  lines.push('  /* spacing (4px base) */')
  for (const [k, v] of Object.entries(p.space)) lines.push(decl(`--ui-space-${k}`, v))
  lines.push('  /* type scale (root 16px) */')
  for (const [k, v] of Object.entries(p['font-size'])) lines.push(decl(`--ui-text-${k}`, v))
  for (const [k, v] of Object.entries(p['line-height'])) lines.push(decl(`--ui-leading-${k}`, v))
  for (const [k, v] of Object.entries(p.tracking)) lines.push(decl(`--ui-tracking-${k}`, v))
  for (const [k, v] of Object.entries(p['font-weight'])) lines.push(decl(`--ui-weight-${k}`, v))
  lines.push(decl('--ui-measure', p.measure.prose))
  lines.push('  /* grid */')
  for (const [k, v] of Object.entries(tokens.grid)) lines.push(decl(`--ui-grid-${k}`, v))
  lines.push('  /* motion (spec §6.2) */')
  const m = tokens.motion
  for (const [k, v] of Object.entries(m.duration)) lines.push(decl(durationVar(k), `${v}ms`))
  for (const [k, v] of Object.entries(m.easing)) lines.push(decl(easingVar(k), bezier(v)))
  lines.push(decl('--ui-reveal-distance', `${m.distance.reveal}px`))
  lines.push(decl('--ui-stagger', `${m.distance.stagger}ms`))
  lines.push(decl('--ui-stagger-max', String(m.distance['stagger-max'])))
  lines.push(decl('--ui-tilt-max', `${m.distance['tilt-max']}deg`))
  lines.push(decl('--ui-lift', `${m.distance.lift}px`))
  lines.push('  /* component tokens */')
  for (const [k, v] of Object.entries(tokens.component)) {
    lines.push(decl(`--ui-${k}`, String(v).replace(/\{([^}]+)\}/g, (_, r) => `var(--ui-${r})`)))
  }
  return lines
}

/** CSS value for a role: {role} becomes var(--ui-role) so runtime overrides (ensureContrast) cascade; {p.*} is inlined. */
export function cssRoleValue(tokens, raw) {
  return String(raw).replace(/\{([^}]+)\}/g, (_, ref) => (ref.startsWith('p.') ? primitive(tokens, ref.slice(2)) : `var(--ui-${ref})`))
}

/** Roles whose raw value references (transitively) any of `changed`. */
function dependents(raw, changed) {
  const out = new Set(changed)
  let grew = true
  while (grew) {
    grew = false
    for (const [role, value] of Object.entries(raw)) {
      if (out.has(role)) continue
      const refs = [...String(value).matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
      if (refs.some((r) => out.has(r))) {
        out.add(role)
        grew = true
      }
    }
  }
  return out
}

/** Semantic declarations for one theme variant. Validates that it resolves completely first. */
export function semanticDecls(tokens, name, { palette } = {}) {
  resolveTheme(tokens, name, palette)
  const raw = rawThemeRoles(tokens, name, palette)
  const theme = tokens.themes[name]
  const lines = []
  if (!palette) lines.push(decl('color-scheme', themeScheme(tokens, name)))
  const emit = palette ? dependents(raw, Object.keys(theme.palettes[palette])) : new Set(tokens.roles)
  for (const role of tokens.roles) if (emit.has(role)) lines.push(decl(`--ui-${role}`, cssRoleValue(tokens, raw[role])))
  if (!palette) {
    for (const [k, v] of Object.entries(themeElevation(tokens, name))) lines.push(decl(`--ui-${k}`, v))
    for (const [k, v] of Object.entries(themeExtra(tokens, name))) lines.push(decl(`--ui-${k}`, v))
    for (const [k, v] of Object.entries(theme.legacy || {})) lines.push(decl(`--q-${k.slice(2)}`, v))
  }
  return lines
}

/* ---- Contrast helpers (mirror src/utils/contrast.ts; scripts cannot import TypeScript). ---- */
const rgbOf = (hex) => {
  const n = hexToInt(hex)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const hexOf = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
const lin = (v) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
export function luminance(hex) {
  const [r, g, b] = rgbOf(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
/** srgb mix, the same arithmetic as color-mix(in srgb, b t, a). t=0 is a, t=1 is b. */
export function mixHex(a, b, t) {
  const ca = rgbOf(a)
  const cb = rgbOf(b)
  return hexOf(ca.map((v, i) => v + (cb[i] - v) * t))
}

/**
 * Increase Contrast overrides for one theme (tokens.json "high-contrast"; spec §9, Apple HIG).
 * Returns { role: value } for every role that changes: raised roles as hex, aliases as the old
 * resolved hex of their source, solid roles as var(--ui-<role>). Raising never lowers a role that
 * already passes; it picks the smallest mix toward the target in 1% steps.
 */
export function highContrastRoles(tokens, name) {
  const spec = tokens['high-contrast']
  const roles = resolveTheme(tokens, name)
  const bgs = spec.on.map((r) => roles[r])
  const worst = (hex) => Math.min(...bgs.map((bg) => contrast(hex, bg)))
  const extreme = themeScheme(tokens, name) === 'light' ? '#000000' : '#ffffff'
  const out = {}
  const now = { ...roles }
  for (const { role, min, toward } of spec.raise) {
    const from = now[role]
    if (!HEX_RE.test(from)) throw new Error(`high-contrast: ${name} ${role} must be a hex colour`)
    const target = toward === 'extreme' ? extreme : now[toward]
    let value = expandHex(from)
    for (let step = 0; step <= 100 && worst(value) < min; step++) value = mixHex(from, target, step / 100)
    if (worst(value) < min) throw new Error(`high-contrast: ${name} ${role} cannot reach ${min}:1`)
    if (value !== expandHex(from)) out[role] = value
    now[role] = value
  }
  for (const [role, source] of Object.entries(spec.alias)) out[role] = expandHex(roles[source])
  for (const [role, source] of Object.entries(spec.solid)) out[role] = `var(--ui-${source})`
  return out
}

/** The same overrides as fully resolved values (solid roles resolved too), for tests and docs. */
export function resolveHighContrast(tokens, name) {
  const roles = resolveTheme(tokens, name)
  const hc = highContrastRoles(tokens, name)
  const out = { ...roles }
  for (const [role, value] of Object.entries(hc)) out[role] = String(value).replace(/^var\(--ui-(.+)\)$/, (_, r) => roles[r])
  return out
}

function highContrastBlock(tokens, name, selectors) {
  const hc = highContrastRoles(tokens, name)
  return ['@media (prefers-contrast: more) {', `  ${selectors.join(',\n  ')} {`, ...Object.entries(hc).map(([k, v]) => `  ${decl(`--ui-${k}`, v)}`), '  }', '}']
}

export const DEFAULT_THEME = 'trident-studio'

/**
 * The shared mobile interaction contract (spec §6.2): touch and focus sizing plus the three
 * mobile motion durations. It is a contract, not a palette — no brand colour is emitted, so a
 * product surface can adopt the shared interaction behaviour and keep its own identity.
 */
export const MOBILE_CONTRACT_DURATIONS = ['mobile-fast', 'mobile-base', 'mobile-slow']

export function buildMobileContractCss(tokens) {
  return [
    HEADER,
    '/* @trident/ui — generated mobile interaction contract from tokens.json. */',
    ':root {',
    `  --ui-target-touch: ${tokens.component['target-touch']};`,
    `  --ui-target-game: ${tokens.component['target-game']};`,
    `  --ui-focus-width: ${tokens.component['focus-width']};`,
    `  --ui-focus-offset: ${tokens.component['focus-offset']};`,
    ...MOBILE_CONTRACT_DURATIONS.map((name) => `  --ui-dur-${name}: ${tokens.motion.duration[name]}ms;`),
    '}',
    '',
  ].join('\n')
}

export function buildTokensCss(tokens) {
  return [
    HEADER,
    '/* Primitives + semantic defaults (fleet dark, trident-studio accent). Themes override the semantic layer only. */',
    ':root {',
    ...globalDecls(tokens),
    `  /* semantic defaults = ${DEFAULT_THEME} */`,
    ...semanticDecls(tokens, DEFAULT_THEME),
    '}',
    ...highContrastBlock(tokens, DEFAULT_THEME, [':root']),
    '',
  ].join('\n')
}

/** Extra selectors a theme answers to, for pre-migration markup. */
const THEME_COMPAT_SELECTORS = {
  'wmh-dark': [':root[data-portal-theme="wm-dark"]'],
  'wmh-marketing': ['[data-surface="marketing"]'],
}

export function buildThemeCss(tokens, name) {
  const theme = tokens.themes[name]
  const selectors = [`[data-theme="${name}"]`, ...(THEME_COMPAT_SELECTORS[name] || [])]
  const out = [HEADER, `/* theme: ${name}${theme.description ? ` — ${theme.description}` : ''} */`]
  out.push(`${selectors.join(',\n')} {`, ...semanticDecls(tokens, name), '}')
  for (const palette of Object.keys(theme.palettes || {})) {
    out.push(
      `[data-theme="${name}"][data-portal-palette="${palette}"],\n[data-theme="${name}"] [data-portal-palette="${palette}"] {`,
      ...semanticDecls(tokens, name, { palette }),
      '}',
    )
  }
  out.push(...highContrastBlock(tokens, name, selectors))
  return out.join('\n') + '\n'
}

/** fleet.css: the shared fleet base under data-theme="fleet" (identical to trident-studio). */
export function buildFleetCss(tokens) {
  return buildThemeCss(tokens, DEFAULT_THEME)
    .replaceAll(`[data-theme="${DEFAULT_THEME}"]`, '[data-theme="fleet"]')
    .replace(`/* theme: ${DEFAULT_THEME}`, '/* theme: fleet (base; same values as trident-studio)')
}

export const LEGACY_ALIASES = {
  // trident-glass.css
  '--tg-bg': 'var(--ui-bg)',
  '--tg-bg2': 'var(--ui-bg-2)',
  '--tg-ink': 'var(--ui-ink)',
  '--tg-muted': 'var(--ui-muted)',
  '--tg-line': 'var(--ui-line)',
  '--tg-a1': 'var(--ui-accent-1)',
  '--tg-a2': 'var(--ui-accent-2)',
  '--tg-grad': 'var(--ui-accent-grad)',
  '--tg-glow': 'var(--ui-glow)',
  '--tg-glass': 'var(--ui-glass)',
  '--tg-glass-strong': 'var(--ui-glass-strong)',
  '--tg-glass-edge': 'var(--ui-glass-edge)',
  '--tg-specular': 'var(--ui-specular)',
  '--tg-display': 'var(--ui-font-display)',
  '--tg-body': 'var(--ui-font-body)',
  '--tg-r': 'var(--ui-r)',
  '--tg-r-lg': 'var(--ui-r-lg)',
  '--tg-r-pill': 'var(--ui-r-pill)',
  '--tg-fast': 'var(--ui-dur-fast)',
  '--tg-med': 'var(--ui-dur-med)',
  '--tg-ease': 'var(--ui-ease)',
  '--tg-spring': 'var(--ui-spring)',
  // WMH portal ds.css / tokens/colors.css
  '--violet-50': 'var(--p-violet-50)',
  '--violet-100': 'var(--p-violet-100)',
  '--violet-300': 'var(--p-violet-300)',
  '--violet-500': 'var(--p-violet-500)',
  '--violet-600': 'var(--p-violet-600)',
  '--violet-700': 'var(--p-violet-700)',
  '--violet-glow': 'rgba(124,58,237,.18)',
  '--glass-surface': 'var(--ui-glass)',
  '--glass-surface-strong': 'var(--ui-glass-strong)',
  '--glass-shadow': 'var(--ui-e2)',
  '--glass-shadow-hover': 'var(--ui-e3)',
  '--glass-blur': 'var(--ui-blur)',
  '--glass-blur-heavy': 'var(--ui-blur-heavy)',
  '--glass-border': 'var(--ui-glass-edge)',
  '--dur-fast': 'var(--ui-dur-fast)',
  '--dur': 'var(--ui-dur)',
  '--dur-slow': 'var(--ui-dur-med)',
  '--dur-page': 'var(--ui-dur-page)',
  '--dur-reveal': 'var(--ui-dur-reveal)',
  '--dur-count': 'var(--ui-dur-count)',
  // Trident Ops
  '--primary': 'var(--ui-accent-1)',
  '--primary-light': 'var(--ui-accent-1)',
  '--primary-dark': 'var(--ui-accent-2)',
  '--bg-card': 'var(--ui-glass)',
}

export function buildLegacyAliasesCss(tokens) {
  const lines = [
    HEADER,
    '/* Legacy aliases (spec §2.1): old names -> --ui-*. Each repo deletes this import once its CSS is ported. */',
    ':root,\n[data-theme] {',
    ...Object.entries(LEGACY_ALIASES).map(([k, v]) => decl(k, v)),
    '}',
    '/* Quorum: theme.js reads these names by value; --q-* literals are set by themes/quorum.css. */',
    '[data-theme="quorum"] {',
    ...Object.keys(tokens.themes.quorum.legacy).map((k) => decl(k, `var(--q-${k.slice(2)})`)),
    '}',
  ]
  return lines.join('\n') + '\n'
}

/** Resolved hex roles per theme as 0xRRGGBB ints (three.js). Non-hex roles are skipped. */
export function threeColors(tokens) {
  const out = {}
  for (const name of Object.keys(tokens.themes)) {
    const roles = resolveTheme(tokens, name)
    const ints = {}
    for (const [role, value] of Object.entries(roles)) if (HEX_RE.test(value)) ints[role] = hexToInt(value)
    out[name] = ints
  }
  return out
}

/**
 * Every (theme, palette) variant's hex roles as 0xRRGGBB ints: the data src/three/generated.ts
 * ships in the lazy 3D payload. Precomputed so that payload carries only these ints, not all of
 * tokens.json (spec §6.6 ≤250KB gz). Palette maps are complete (theme roles + palette overrides).
 */
export function threeColorTable(tokens) {
  const ints = (roles) => {
    const out = {}
    for (const [role, value] of Object.entries(roles)) if (HEX_RE.test(value)) out[role] = hexToInt(value)
    return out
  }
  const themes = {}
  const palettes = {}
  for (const { theme, palette } of themeVariants(tokens)) {
    if (palette) (palettes[theme] ??= {})[palette] = ints(resolveTheme(tokens, theme, palette))
    else themes[theme] = ints(resolveTheme(tokens, theme))
  }
  return { themes, palettes }
}

export const THREE_COLOR_TABLE_FILE = 'src/three/generated-colors.json'

/** src/three/generated-colors.json, written by scripts/build-tokens.mjs. */
export function buildThreeColorTableJson(tokens) {
  const note = 'GENERATED from tokens.json by scripts/build-tokens.mjs (npm run build:tokens). Do not edit.'
  return JSON.stringify({ $comment: note, ...threeColorTable(tokens) }, null, 2) + '\n'
}

export function quorumFallback(tokens) {
  const out = {}
  for (const [k, v] of Object.entries(tokens.themes.quorum.legacy)) out[k] = expandHex(v)
  return out
}

export function jsTokens(tokens) {
  const themes = {}
  for (const name of Object.keys(tokens.themes)) {
    const t = tokens.themes[name]
    const palettes = {}
    for (const p of Object.keys(t.palettes || {})) palettes[p] = resolveTheme(tokens, name, p)
    themes[name] = { scheme: themeScheme(tokens, name), roles: resolveTheme(tokens, name), extra: themeExtra(tokens, name), palettes }
  }
  const m = tokens.motion
  return {
    themes,
    durations: m.duration,
    easings: m.easing,
    springs: m.spring,
    distances: m.distance,
    motionRules: m.rules,
    space: tokens.primitives.space,
    radius: tokens.primitives.radius,
    fontSize: tokens.primitives['font-size'],
    fontStack: tokens.primitives['font-stack'],
    grid: tokens.grid,
    component: tokens.component,
    elevation: tokens.elevation,
    colors: tokens.primitives.color,
  }
}

/** A readonly TypeScript type literal for a JSON value (for generated .d.ts files). */
export function tsType(value, indent = '') {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `readonly [${value.map((v) => tsType(v, indent)).join(', ')}]`
  if (typeof value === 'object') {
    const inner = indent + '  '
    const entries = Object.entries(value).map(([k, v]) => `${inner}readonly ${JSON.stringify(k)}: ${tsType(v, inner)};`)
    return entries.length ? `{\n${entries.join('\n')}\n${indent}}` : '{}'
  }
  return JSON.stringify(value)
}

export function buildTokensModule(tokens) {
  const t = jsTokens(tokens)
  const js = [`// @trident/ui/tokens.mjs — GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.`]
  const dts = [`// GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.`]
  for (const [k, v] of Object.entries(t)) {
    js.push(`export const ${k} = Object.freeze(${JSON.stringify(v, null, 2)});`)
    dts.push(`export declare const ${k}: ${tsType(v)};`)
  }
  js.push(`export const themeNames = Object.freeze(Object.keys(themes));`)
  dts.push(`export type ThemeName = keyof typeof themes;`, `export declare const themeNames: readonly ThemeName[];`)
  js.push(`/** ms -> seconds, for motion/react transitions. */\nexport const seconds = (ms) => ms / 1000;`)
  dts.push(`/** ms -> seconds, for motion/react transitions. */\nexport declare function seconds(ms: number): number;`)
  return { js: js.join('\n\n') + '\n', dts: dts.join('\n\n') + '\n' }
}

export function buildThreeModule(tokens) {
  const colors = threeColors(tokens)
  const fb = quorumFallback(tokens)
  const hexLit = (n) => `0x${n.toString(16).padStart(6, '0')}`
  const js = [
    `// @trident/ui/three.mjs — GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.`,
    `// three.js colour constants (0xRRGGBB) per theme, so R3F scenes never hand-keep a palette.`,
  ]
  const themeBlocks = Object.entries(colors).map(([name, ints]) => {
    const body = Object.entries(ints).map(([role, n]) => `    ${JSON.stringify(role)}: ${hexLit(n)},`).join('\n')
    return `  ${JSON.stringify(name)}: Object.freeze({\n${body}\n  }),`
  })
  js.push(`export const THREE_COLORS = Object.freeze({\n${themeBlocks.join('\n')}\n});`)
  js.push(`/** Quorum's theme.js FALLBACK map, generated (hex strings). */\nexport const QUORUM_FALLBACK = Object.freeze(${JSON.stringify(fb, null, 2)});`)
  const fbInts = Object.fromEntries(Object.entries(fb).map(([k, v]) => [k, hexToInt(v)]))
  js.push(
    `/** Same, as 0xRRGGBB ints. */\nexport const QUORUM_FALLBACK_INT = Object.freeze({\n${Object.entries(fbInts)
      .map(([k, n]) => `  ${JSON.stringify(k)}: ${hexLit(n)},`)
      .join('\n')}\n});`,
  )
  js.push(
    `/** Colour ints for one theme; unknown names fall back to ${DEFAULT_THEME}. */\nexport function themeColors(name) {\n  return THREE_COLORS[name] || THREE_COLORS[${JSON.stringify(DEFAULT_THEME)}];\n}`,
  )
  const roleType = `{ readonly [role: string]: number }`
  const dts = [
    `// GENERATED from tokens.json by scripts/build-tokens.mjs. Do not edit.`,
    `export type ThreeThemeName = ${Object.keys(colors).map((n) => JSON.stringify(n)).join(' | ')};`,
    `export declare const THREE_COLORS: { readonly [K in ThreeThemeName]: ${roleType} };`,
    `export declare const QUORUM_FALLBACK: ${tsType(fb)};`,
    `export declare const QUORUM_FALLBACK_INT: { readonly [K in keyof typeof QUORUM_FALLBACK]: number };`,
    `export declare function themeColors(name: string): ${roleType};`,
  ]
  return { js: js.join('\n\n') + '\n', dts: dts.join('\n\n') + '\n' }
}
