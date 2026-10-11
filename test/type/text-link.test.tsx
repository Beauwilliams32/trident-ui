/** TextLink (G1): the themed link every package link shares. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { TextLink } from '../../src'

const css = readFileSync(join(import.meta.dirname, '../../src/type/styles.css'), 'utf8')

describe('TextLink', () => {
  it('is a real <a href> with the .ui-link class, underlined by default', () => {
    render(<TextLink href="/terms">Terms</TextLink>)
    const a = screen.getByRole('link', { name: 'Terms' })
    expect(a.getAttribute('href')).toBe('/terms')
    expect(a.className).toBe('ui-link')
    expect(a.hasAttribute('data-underline')).toBe(false)
  })

  it('supports hover-only underline, inherited tone and extra classes', () => {
    render(
      <TextLink href="#a" underline="hover" tone="inherit" className="x">
        Nav
      </TextLink>,
    )
    const a = screen.getByRole('link', { name: 'Nav' })
    expect(a.className).toBe('ui-link x')
    expect(a.dataset.underline).toBe('hover')
    expect(a.dataset.tone).toBe('inherit')
  })

  it('opens new tabs safely and says so to screen readers', () => {
    render(
      <TextLink href="https://example.com" target="_blank">
        Docs
      </TextLink>,
    )
    // Browsers keep the hint's leading space; jsdom's name computation trims each text node.
    const a = screen.getByRole('link', { name: /^Docs ?\(opens in a new tab\)$/ })
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('keeps an explicit rel', () => {
    render(
      <TextLink href="https://example.com" target="_blank" rel="noopener" newTabHint="">
        Docs
      </TextLink>,
    )
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('rel')).toBe('noopener')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <p>
        Read the <TextLink href="/terms">terms</TextLink>.
      </p>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('CSS: accent-text colour, underline, forced-colors LinkText', () => {
    expect(css).toMatch(/\.ui-link \{[^}]*color: var\(--ui-accent-text\);[^}]*text-decoration-line: underline;/)
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.ui-link \{\s*color: LinkText;/)
  })
})
