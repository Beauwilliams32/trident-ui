/**
 * G11: the procedural poster's glow ends inside the slot. G21: the visible StatusOrbit list uses
 * status pills and still reads exactly "<label>: <state>" per card (the honesty contract).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { stateText, statusCards } from '../statusCards'
import { StatusOrbitList } from '../StatusOrbit'

const css = readFileSync(join(import.meta.dirname, '../styles.css'), 'utf8')

describe('procedural poster (G11)', () => {
  it('sizes both glows in percent and ends them before every edge', () => {
    const rule = /\.ui-poster--procedural \{([^}]*)\}/.exec(css)![1]!
    const ellipses = [...rule.matchAll(/radial-gradient\(ellipse (\d+)% (\d+)% at (\d+)% (\d+)%/g)].map((m) => m.slice(1).map(Number))
    expect(ellipses).toHaveLength(2)
    for (const [rx, ry, cx, cy] of ellipses) {
      expect(cx! + rx!, 'right edge').toBeLessThanOrEqual(98)
      expect(cx! - rx!, 'left edge').toBeGreaterThanOrEqual(2)
      expect(cy! + ry!, 'bottom edge').toBeLessThanOrEqual(98)
      expect(cy! - ry!, 'top edge').toBeGreaterThanOrEqual(2)
    }
    expect(rule).not.toMatch(/circle at/)
  })
})

describe('visible StatusOrbitList (G21)', () => {
  const items = [
    { id: 'instagram', label: 'Instagram', live: true },
    { id: 'youtube', label: 'YouTube', state: 'pending' as const },
  ]

  it('one row per card whose text is exactly "<label>: <state>", with the state as a pill', async () => {
    const { container } = render(<StatusOrbitList items={items} visible label="Status" />)
    const list = screen.getByRole('list', { name: 'Status' })
    expect(list.hasAttribute('data-visible')).toBe(true)
    const rows = within(list).getAllByRole('listitem')
    const cards = statusCards(items)
    expect(rows.map((r) => r.textContent)).toEqual(cards.map((c) => `${c.label}: ${stateText(c.state)}`))
    expect(rows[0]!.querySelector('.ui-status')!.getAttribute('data-tone')).toBe('ok')
    expect(rows[1]!.querySelector('.ui-status')!.getAttribute('data-tone')).toBe('warn')
    // Nothing but a live platform is green.
    for (const [i, c] of cards.entries()) if (c.state !== 'live') expect(rows[i]!.querySelector('.ui-status')!.getAttribute('data-tone')).not.toBe('ok')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('the hidden list is unchanged plain text', () => {
    render(<StatusOrbitList items={items} label="Hidden" />)
    const list = screen.getByRole('list', { name: 'Hidden' })
    expect(list.className).toContain('ui-visually-hidden')
    expect(list.querySelector('.ui-status')).toBeNull()
  })
})
