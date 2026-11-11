/** tokens.json is the single source (spec §2.1); these pin the spec §3 and §6.2 values it must carry. */
import { describe, expect, it } from 'vitest'
import {
  buildLegacyAliasesCss,
  buildThemeCss,
  buildThreeModule,
  buildTokensCss,
  buildTokensModule,
  hexToInt,
  loadTokens,
  resolveTheme,
  threeColors,
} from '../scripts/lib/tokens.mjs'

const tokens = loadTokens()

describe('spec §3 fleet values', () => {
  const fleet = resolveTheme(tokens, 'trident-studio')
  it.each([
    ['bg', '#070d16'],
    ['bg-2', '#0b1422'],
    ['surface', '#0e1a2b'],
    ['glass', 'color-mix(in srgb, #0e1a2b 62%, transparent)'],
    ['glass-strong', 'color-mix(in srgb, #0e1a2b 82%, transparent)'],
    ['glass-edge', 'rgba(255,255,255,.08)'],
    ['specular', 'rgba(255,255,255,.13)'],
    ['line', 'rgba(148,199,255,.12)'],
    ['ink', '#e9f2fb'],
    ['ink-2', '#b7c7d8'],
    ['muted', '#8fa5bc'],
    ['on-accent', '#06121d'],
    ['ok', '#34d399'],
    ['warn', '#fbbf24'],
    ['danger', '#f87171'],
    ['info', '#7dd3fc'],
  ])('%s = %s', (role, value) => expect(fleet[role]).toBe(value))

  it.each([
    ['trident-studio', '#2dd4bf', '#38bdf8'],
    ['trident-nil', '#fbbf24', '#f97316'],
    ['trident-ops', '#2fd39a', '#0f9f72'],
    ['trident-playbook', '#a78bfa', '#818cf8'],
    ['trident-tools', '#0ea5e9', '#6366f1'],
    ['trident-agents', '#d946ef', '#8b5cf6'],
  ])('%s accent pair %s -> %s, accent-text is the first colour', (theme, a1, a2) => {
    const r = resolveTheme(tokens, theme)
    expect([r['accent-1'], r['accent-2'], r['accent-text']]).toEqual([a1, a2, a1])
  })
})

describe('spec §3 brand values', () => {
  it('wmh-portal', () => {
    const r = resolveTheme(tokens, 'wmh-portal')
    expect([r.bg, r.surface, r.ink, r['accent-1'], r['accent-2']]).toEqual(['#f7f9fd', '#ffffff', '#0b1220', '#7c3aed', '#2563eb'])
    expect(tokens.elevation.light.e2).toBe('0 18px 48px rgba(15,23,42,.09), 0 2px 10px rgba(15,23,42,.05)')
    expect([r.blur, r['blur-heavy']]).toEqual(['18px', '28px'])
  })
  it('wmh-marketing', () => {
    const r = resolveTheme(tokens, 'wmh-marketing')
    expect([r.bg, r['bg-2'], r['accent-text']]).toEqual(['#04040a', '#060e1a', '#b69bff'])
    expect(tokens.themes['wmh-marketing'].extra).toMatchObject({ eyebrow: '#e8b84a', 'eyebrow-2': '#c9a84c', 'logo-grad': 'linear-gradient(135deg, #5d0045, #210018)' })
  })
  it('portfolio', () => {
    const r = resolveTheme(tokens, 'portfolio')
    expect([r.bg, r['bg-2'], r.surface, r.ink, r.muted, r['accent-1'], r['accent-2'], r.glow, r.r]).toEqual([
      '#0d0a0a', '#151010', '#191313', '#f4eee9', '#a89a93', '#e34c4c', '#b93a3a', 'rgba(227,76,76,.32)', '14px',
    ])
  })
  it('quorum', () => {
    const r = resolveTheme(tokens, 'quorum')
    expect([r.bg, r['bg-2'], r.ink, r.muted, r['accent-1'], r.warn, r.ok]).toEqual(['#111728', '#0c101c', '#ffffff', '#8793ab', '#8fa3c7', '#f5b83d', '#2fd39a'])
    expect([r['status-live'], r['status-attention'], r['status-ok']]).toEqual(['#8fa3c7', '#f5b83d', '#2fd39a'])
  })
  it('trident-ops', () => {
    const r = resolveTheme(tokens, 'trident-ops')
    expect([r.bg, r['bg-2'], r.surface, r['surface-raised']]).toEqual(['#0c1a26', '#0e242c', '#0e242c', '#0e242c'])
    expect([r.glass, r['glass-strong']]).toEqual(['color-mix(in srgb, #0e242c 62%, transparent)', 'color-mix(in srgb, #0e242c 82%, transparent)'])
    expect([r.line, r['line-strong'], r.ink, r['ink-2'], r.muted]).toEqual(['#113738', '#687688', '#ffffff', '#d2d7e1', '#9aa7bd'])
    expect([r['accent-1'], r['accent-2'], r['on-accent']]).toEqual(['#2fd39a', '#0f9f72', '#0b0b0d'])
    expect([r.ok, r.warn, r.danger, r.info]).toEqual(['#2fd39a', '#f5b83d', '#ff6b5e', '#3ba8f0'])
    expect([r['status-live'], r['status-attention'], r['status-ok'], r['status-error']]).toEqual(['#2fd39a', '#f5b83d', '#2fd39a', '#ff6b5e'])
    // The fleet type contract still holds for Ops (spec §4); only colour and radius follow the brand.
    expect(r['font-display']).toContain('Space Grotesk')
    expect(r['font-body']).toContain('Inter')
    expect(r['r-lg']).toBe('24px')
  })
})

describe('spec §6.2 motion tokens', () => {
  const m = tokens.motion
  it('durations', () =>
    expect(m.duration).toEqual({ instant: 80, fast: 160, 'mobile-fast': 160, 'mobile-base': 240, 'mobile-slow': 320, base: 200, page: 260, med: 320, slow: 480, reveal: 600, count: 1100 }))
  it('easings', () =>
    expect(m.easing).toEqual({
      ease: [0.2, 0.8, 0.2, 1],
      emph: [0.2, 0, 0, 1],
      exit: [0.4, 0, 1, 1],
      inout: [0.4, 0, 0.2, 1],
      spring: [0.22, 1.2, 0.36, 1],
      'spring-pop': [0.34, 1.4, 0.64, 1],
    }))
  it('springs', () => {
    expect(m.spring.snappy).toEqual({ stiffness: 520, damping: 38, mass: 0.8 })
    expect(m.spring.smooth).toMatchObject({ stiffness: 300, damping: 34 })
    expect(m.spring.gentle).toMatchObject({ stiffness: 160, damping: 26 })
  })
  it('distances', () => expect(m.distance).toEqual({ reveal: 18, stagger: 70, 'stagger-max': 6, 'tilt-max': 7, lift: -3 }))
  it('tokens.css carries the CSS forms', () => {
    const css = buildTokensCss(tokens)
    for (const line of [
      '--ui-dur-instant: 80ms;',
      '--ui-dur-fast: 160ms;',
      '--ui-dur: 200ms;',
      '--ui-dur-page: 260ms;',
      '--ui-dur-med: 320ms;',
      '--ui-dur-slow: 480ms;',
      '--ui-dur-reveal: 600ms;',
      '--ui-dur-count: 1100ms;',
      '--ui-ease: cubic-bezier(.2,.8,.2,1);',
      '--ui-ease-emph: cubic-bezier(.2,0,0,1);',
      '--ui-ease-exit: cubic-bezier(.4,0,1,1);',
      '--ui-ease-inout: cubic-bezier(.4,0,.2,1);',
      '--ui-spring: cubic-bezier(.22,1.2,.36,1);',
      '--ui-spring-pop: cubic-bezier(.34,1.4,.64,1);',
      '--ui-reveal-distance: 18px;',
      '--ui-stagger: 70ms;',
      '--ui-tilt-max: 7deg;',
      '--ui-lift: -3px;',
    ])
      expect(css).toContain(line)
  })
})

describe('spec §4/§5 scale', () => {
  it('type scale and spacing', () => {
    expect(tokens.primitives['font-size'].display).toBe('clamp(40px, 6vw, 76px)')
    expect((Object.values(tokens.primitives.space) as string[]).sort((a, b) => parseInt(a) - parseInt(b))).toEqual(
      [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128].map((n) => `${n}px`),
    )
    expect(tokens.primitives.radius).toEqual({ xs: '6px', sm: '10px', md: '16px', lg: '22px', pill: '999px' })
  })
})

describe('generated outputs', () => {
  it('tokens.css declares every semantic role', () => {
    const css = buildTokensCss(tokens)
    for (const role of tokens.roles) expect(css).toContain(`--ui-${role}:`)
  })

  it.each(Object.keys(tokens.themes))('themes/%s.css is self-contained and small', (name) => {
    const css = buildThemeCss(tokens, name)
    expect(css).toContain(`[data-theme="${name}"]`)
    for (const role of tokens.roles) expect(css).toContain(`--ui-${role}:`)
    expect(Buffer.byteLength(css)).toBeLessThan(12 * 1024) // raw bytes; spec budget is 12KB gz
  })

  it('role references stay live in CSS so runtime accent overrides cascade', () => {
    const css = buildThemeCss(tokens, 'trident-nil')
    expect(css).toContain('--ui-accent-grad: linear-gradient(135deg, var(--ui-accent-1), var(--ui-accent-2));')
    expect(css).toContain('--ui-accent-text: var(--ui-accent-1);')
  })

  it('legacy aliases map the four legacy families to --ui-*', () => {
    const css = buildLegacyAliasesCss(tokens)
    for (const name of ['--tg-a1', '--violet-500', '--glass-surface', '--dur-fast', '--primary', '--bg-card']) {
      expect(css).toMatch(new RegExp(`${name}: var\\(--(ui|p)-`))
    }
    expect(css).toContain('--fg0: var(--q-fg0);')
  })

  it('three.mjs ints equal the resolved hex roles', () => {
    const colors = threeColors(tokens)
    for (const name of Object.keys(tokens.themes)) {
      const r = resolveTheme(tokens, name)
      expect(colors[name]!['accent-1']).toBe(hexToInt(r['accent-1']!))
      expect(colors[name]!.bg).toBe(hexToInt(r.bg!))
    }
    const mod = buildThreeModule(tokens)
    expect(mod.js).toContain('"accent-1": 0x2dd4bf')
    expect(mod.dts).toContain('export declare const THREE_COLORS')
  })

  it('tokens.mjs exports motion constants for R3F damping', async () => {
    const mod = buildTokensModule(tokens)
    const url = `data:text/javascript;base64,${Buffer.from(mod.js).toString('base64')}`
    const m = await import(/* @vite-ignore */ url)
    expect(m.durations.fast).toBe(160)
    expect(m.springs.snappy.stiffness).toBe(520)
    expect(m.themes['wmh-portal'].scheme).toBe('light')
    expect(m.seconds(200)).toBe(0.2)
    expect(Object.isFrozen(m.durations)).toBe(true)
  })

  it('rejects unknown references and cycles', async () => {
    const { resolveRoles } = await import('../scripts/lib/tokens.mjs')
    expect(() => resolveRoles(tokens, { a: '{b}' })).toThrow(/unknown role/)
    expect(() => resolveRoles(tokens, { a: '{b}', b: '{a}' })).toThrow(/cycle/)
    expect(() => resolveRoles(tokens, { a: '{p.nope.x}' })).toThrow(/unknown primitive/)
  })
})
