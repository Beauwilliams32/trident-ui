import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import studioGlyphInk from '../brand/studio-glyph-ink.svg?no-inline'
import studioGlyphWhite from '../brand/studio-glyph-white.svg?no-inline'
import { BrandLockup, BrandMark, TridentMark } from '../src/marketing'

describe('Trident Studio house mark', () => {
  it('uses the approved glyph with ink and white tones and 2:3 proportions', () => {
    const { container, getByRole } = render(
      <>
        <BrandMark title="Trident Studio" size={30} />
        <BrandMark tone="white" title="Trident Studio on dark" size={45} />
      </>,
    )

    const ink = getByRole('img', { name: 'Trident Studio' })
    const white = getByRole('img', { name: 'Trident Studio on dark' })
    expect(ink.getAttribute('src')).toBe(studioGlyphInk)
    expect(white.getAttribute('src')).toBe(studioGlyphWhite)
    expect([ink.getAttribute('width'), ink.getAttribute('height')]).toEqual(['20', '30'])
    expect([white.getAttribute('width'), white.getAttribute('height')]).toEqual(['30', '45'])
    expect(container.querySelectorAll('linearGradient')).toHaveLength(0)
  })

  it('keeps the mark decorative in a lockup and exposes the semantic TridentMark alias', () => {
    const { container, getByText } = render(
      <BrandLockup name="Trident UI" kicker="Trident Studio" />,
    )

    const mark = container.querySelector('img.ui-brand-mark')
    expect(mark?.getAttribute('src')).toBe(studioGlyphInk)
    expect(mark?.getAttribute('alt')).toBe('')
    expect(mark?.getAttribute('aria-hidden')).toBe('true')
    expect(getByText('Trident UI')).toBeTruthy()
    expect(TridentMark).toBe(BrandMark)
  })
})
