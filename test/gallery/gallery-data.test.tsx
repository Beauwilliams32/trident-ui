/**
 * The gallery's build-time data (G4 props tables, G8 token docs, G9 URLs, G14 docs, G17 version).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { galleryMeta } from '../../gallery/data/meta'
import { componentApis } from '../../gallery/data/props'
import { tokenDocs } from '../../gallery/data/tokens'
import { ColorRoles, ShapeRoles } from '../../gallery/docs/TokenDocs'
import { galleryHref, readLocation } from '../../gallery/url'
import { contrast, loadTokens, resolveTheme, ROOT } from '../../scripts/lib/tokens.mjs'

const tokens = loadTokens()
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }

describe('G9 gallery URLs keep the group and the hash', () => {
  it('reads the location', () => {
    expect(readLocation('?theme=wmh-portal&motion=paused&group=forms', '#ex-forms-rtl')).toEqual({ theme: 'wmh-portal', motion: 'paused', group: 'forms', hash: '#ex-forms-rtl' })
    expect(readLocation('', '')).toEqual({ theme: 'fleet', motion: 'on', group: null, hash: '' })
    expect(readLocation('?motion=bogus', '').motion).toBe('on')
  })

  it('a theme or motion switch keeps ?group= and #hash', () => {
    const at = readLocation('?theme=fleet&motion=reduced&group=forms', '#ex-forms-errors')
    expect(galleryHref(at, { theme: 'trident-studio' })).toBe('?theme=trident-studio&motion=reduced&group=forms#ex-forms-errors')
    expect(galleryHref(at, { motion: 'paused' })).toBe('?theme=fleet&motion=paused&group=forms#ex-forms-errors')
    expect(galleryHref(at, { group: null, hash: '' })).toBe('?theme=fleet&motion=reduced')
  })
})

describe('G8 token documentation', () => {
  const docs = tokenDocs()

  it('covers every theme, including fleet', () => {
    expect(Object.keys(docs.themes).sort()).toEqual(['fleet', ...Object.keys(tokens.themes)].sort())
  })

  it.each(Object.keys(docs.themes))('%s renders every semantic role from tokens.json', (name) => {
    const theme = docs.themes[name]!
    const { container } = render(
      <>
        <ColorRoles theme={theme} />
        <ShapeRoles theme={theme} />
      </>,
    )
    const shown = new Set([...container.querySelectorAll('[data-role]')].map((e) => e.getAttribute('data-role')))
    for (const role of tokens.roles) expect(shown.has(role), `${name}: --ui-${role} missing from the tokens page`).toBe(true)
  })

  it('reports the same ratios the contrast matrix measures', () => {
    const roles = resolveTheme(tokens, 'wmh-portal')
    const ink = docs.themes['wmh-portal']!.roles.find((r) => r.role === 'ink')!
    const onBg = ink.pairs.find((p) => p.fg === 'ink' && p.bg === 'bg')!
    expect(onBg.ratio).toBeCloseTo(contrast(roles.ink!, roles.bg!), 2)
    expect(onBg.min).toBe(4.5)
  })

  it('lists the Increase Contrast value where a role changes', () => {
    const muted = docs.themes.fleet!.roles.find((r) => r.role === 'muted')!
    expect(muted.highContrast).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('G17 version and changelog', () => {
  it('come from package.json and CHANGELOG.md', () => {
    const meta = galleryMeta(ROOT)
    expect(meta.version).toBe(pkg.version)
    // The gallery shows the newest CHANGELOG section: 'Unreleased' between releases, the
    // version once it is cut (0.2.0 was cut by hand; see .changeset/archive/README.md).
    expect(['Unreleased', pkg.version]).toContain(meta.changelog[0]!.title)
    expect(meta.changelog[0]!.items.length).toBeGreaterThan(0)
    expect(meta.changelogUrl).toBe('https://github.com/Beauwilliams32/trident-ui/blob/main/CHANGELOG.md')
  })
})

describe('G4 props tables come from the shipped .d.ts', () => {
  it.skipIf(!existsSync(join(ROOT, 'dist/index.d.ts')))('every component in the root, app and marketing entries has a table', () => {
    const apis = componentApis(ROOT)
    const byName = new Map(apis.map((a) => [a.name, a]))
    for (const name of ['Button', 'TextLink', 'Chip', 'Alert', 'ErrorSummary', 'Dialog', 'DataTable', 'EmptyState', 'Hero', 'PricingTable']) expect(byName.has(name), name).toBe(true)
    const variant = byName.get('Button')!.props.find((p) => p.name === 'variant')!
    expect(variant).toMatchObject({ type: 'ButtonVariant', required: false, default: "'primary'" })
    expect(byName.get('Button')!.native).toBe(true)
    expect(byName.get('Button')!.group).toBe('actions')
    expect(byName.get('Dialog')!.entry).toBe('@trident/ui/app')
    expect(byName.get('Hero')!.props.find((p) => p.name === 'title')).toMatchObject({ required: true })
    // Every documented root component belongs to a real gallery group.
    const groups = new Set(['a11y', 'layout', 'type', 'actions', 'forms', 'display', 'feedback', 'app', 'marketing'])
    for (const a of apis) expect(groups.has(a.group), `${a.name} -> ${a.group}`).toBe(true)
  })
})

describe('G14 adoption docs: cascade layers', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
  it('README explains the layer order and the legacy-reset fix', () => {
    expect(readme).toContain('@layer')
    expect(readme).toContain('@layer legacy, ui-base, ui-components, ui-utilities;')
    expect(readme).toMatch(/revert-layer/)
  })
})
