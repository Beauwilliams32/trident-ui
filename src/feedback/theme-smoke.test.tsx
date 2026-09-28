/** Theme x scheme smoke (spec §10.1) for the feedback gallery. Colour is proven in feedback-contrast.test.ts. */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { loadTokens, themeScheme, themeVariants } from '../../scripts/lib/tokens.mjs'
import { examples } from './feedback.gallery'

const tokens = loadTokens()
const variants = themeVariants(tokens).map((v: { id: string; theme: string; palette?: string }) => ({
  ...v,
  scheme: themeScheme(tokens, v.theme) as string,
}))

describe('feedback gallery', () => {
  it('has an example for every component', () => {
    expect(new Set(examples.map((e) => e.component))).toEqual(new Set(['Alert', 'FlashBanner', 'Toast']))
  })
})

describe.each(variants)('feedback in $id ($scheme)', ({ theme, palette, scheme }) => {
  it('renders every example with no axe violations', async () => {
    const { container } = render(
      <main data-theme={theme} data-scheme={scheme} data-portal-palette={palette}>
        {examples.map((ex) => (
          <section key={`${ex.component}-${ex.name}`} aria-label={`${ex.component}: ${ex.name}`}>
            {ex.render()}
          </section>
        ))}
      </main>,
    )
    expect(container.querySelectorAll('.ui-alert').length).toBeGreaterThan(0)
    expect(await axe(container)).toHaveNoViolations()
  })
})
