import { describe, expect, it } from 'vitest'
import { depthLineMark, DEPTH_LINE_CENTER, DEPTH_LINE_LEFT } from '../brand/depth-line.mjs'

describe('Depth Line mark', () => {
  it('renders the same three-rail geometry for every product accent', () => {
    const studio = depthLineMark()
    const nil = depthLineMark({ accent1: '#fbbf24', accent2: '#f97316' })
    for (const svg of [studio, nil]) {
      expect(svg).toContain(`d="${DEPTH_LINE_LEFT}"`)
      expect(svg).toContain(`d="${DEPTH_LINE_CENTER}"`)
      expect(svg.match(/<path /g)).toHaveLength(3)
      expect(svg).toContain('viewBox="0 0 64 64"')
    }
    expect(studio).toContain('#2dd4bf')
    expect(nil).toContain('#fbbf24')
  })

  it('keeps accessible names escaped and refuses arbitrary markup as a color', () => {
    expect(depthLineMark({ title: 'Trident & Co' })).toContain('aria-label="Trident &amp; Co"')
    expect(() => depthLineMark({ accent1: 'url(https://example.com)' })).toThrow()
  })

  it('keeps accent gradients independent when two products share a page', () => {
    const studio = depthLineMark()
    const nil = depthLineMark({ accent1: '#fbbf24', accent2: '#f97316' })
    const studioId = studio.match(/<linearGradient id="([^"]+)"/)?.[1]
    const nilId = nil.match(/<linearGradient id="([^"]+)"/)?.[1]
    expect(studioId).toBeTruthy()
    expect(nilId).not.toBe(studioId)
    expect(studio).toContain(`fill="url(#${studioId})"`)
    expect(nil).toContain(`fill="url(#${nilId})"`)
  })
})
