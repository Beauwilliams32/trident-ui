/**
 * PosterFallback loading and fetch priority (G6): an above-the-fold decorative backdrop is eager but
 * LOW priority, so it never competes with the CSS and fonts that paint the text H1. This is the
 * markup Ops hand-wrote in landing/sections.jsx because v0.1.1 could not pass fetchPriority.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PosterFallback } from '../PosterFallback'

describe('PosterFallback image attributes', () => {
  it('passes fetchPriority and loading through to the <img>', () => {
    const html = renderToStaticMarkup(<PosterFallback src="/p.webp" avif="/p.avif" width={1600} height={1000} loading="eager" fetchPriority="low" />)
    expect(html).toContain('loading="eager"')
    // HTML attribute names are case-insensitive; React 19 serialises the prop as fetchPriority.
    expect(html).toMatch(/fetchpriority="low"/i)
    expect(html).toMatch(/<source type="image\/avif" srcSet="\/p.avif"\/>/)
  })

  it('matches the Ops hand-written hero poster markup exactly', () => {
    const ours = renderToStaticMarkup(<PosterFallback src="/posters/ops-lattice.webp" avif="/posters/ops-lattice.avif" width={1600} height={1000} loading="eager" fetchPriority="low" />)
    const ops = renderToStaticMarkup(
      <PosterFallback>
        <picture>
          <source type="image/avif" srcSet="/posters/ops-lattice.avif" />
          <img className="ui-poster__img" src="/posters/ops-lattice.webp" alt="" width={1600} height={1000} loading="eager" decoding="async" fetchPriority="low" />
        </picture>
      </PosterFallback>,
    )
    expect(ours).toBe(ops)
  })

  it('keeps the old behaviour: lazy by default, eager via `eager`, no fetchpriority attribute', () => {
    expect(renderToStaticMarkup(<PosterFallback src="/p.webp" />)).toContain('loading="lazy"')
    expect(renderToStaticMarkup(<PosterFallback src="/p.webp" eager />)).toContain('loading="eager"')
    expect(renderToStaticMarkup(<PosterFallback src="/p.webp" />)).not.toMatch(/fetchpriority/i)
    expect(renderToStaticMarkup(<PosterFallback src="/p.webp" eager loading="lazy" />)).toContain('loading="lazy"')
  })
})
