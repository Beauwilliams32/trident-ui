import { expect, test, type Browser, type Page } from '@playwright/test'
import { openGallery } from './matrix'

/**
 * Touch targets (G5; spec §9 "44px for primary actions on touch", Apple HIG 44pt, Material's touch
 * target). Under (pointer: coarse) every interactive .ui-* control answers taps across at least
 * 44x44, checked with elementFromPoint at the edges of that region, while its drawn size stays what
 * it is with a mouse. The desktop baselines in visual.spec.ts prove the fine-pointer look is unchanged.
 */
const TARGET = 44
/** [control selector, the element whose box is what the user sees]. */
const CONTROLS: Array<[string, string | null]> = [
  ['.ui-btn', null],
  ['.ui-chip__toggle', null],
  ['.ui-chip__remove', null],
  ['.ui-alert__dismiss', null],
  ['.ui-toast__close', null],
  ['.ui-motion-toggle', null],
  ['.ui-choice__input', '.ui-choice__control'],
  ['.ui-input:not(.ui-textarea)', null],
  ['.ui-tabs__tab', null],
  ['.ui-table__sort', null],
  // Gallery chrome (G18): theme and motion links, section links, disclosures.
  ['.g-switch a', null],
  ['.g-version', null],
  ['.g-changelog', null],
  ['.g-jump > summary', null],
  ['.g-code > summary', null],
  ['.g-api > summary', null],
]
const SELECTOR = CONTROLS.map(([s]) => s).join(', ')

interface Probe {
  label: string
  w: number
  h: number
  misses: string[]
}

async function probe(page: Page): Promise<Probe[]> {
  return page.evaluate(
    ({ controls, selector, target }) => {
      const visualOf = (el: Element): Element => {
        for (const [s, v] of controls) if (v && el.matches(s)) return el.closest(v) ?? el
        return el
      }
      const all = [...document.querySelectorAll<HTMLElement>(selector)].filter((el) => {
        const r = el.getBoundingClientRect()
        // Content of a closed <details> is still laid out in Chrome but cannot be tapped.
        const closed = el.closest('details:not([open])')
        const inClosed = closed !== null && !closed.querySelector(':scope > summary')!.contains(el)
        return r.width > 0 && r.height > 0 && !inClosed && !el.closest('[hidden], .ui-visually-hidden') && getComputedStyle(el).visibility !== 'hidden'
      })
      const owner = (hit: Element | null) => (hit ? all.find((c) => c === hit || c.contains(hit)) : undefined)
      const out: Array<{ label: string; w: number; h: number; misses: string[] }> = []
      for (const el of all) {
        el.scrollIntoView({ block: 'center', inline: 'center' })
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const hw = Math.max(r.width, target) / 2 - 1
        const hh = Math.max(r.height, target) / 2 - 1
        const misses: string[] = []
        for (const [x, y, side] of [
          [cx - hw, cy, 'left'],
          [cx + hw, cy, 'right'],
          [cx, cy - hh, 'top'],
          [cx, cy + hh, 'bottom'],
        ] as const) {
          const hit = document.elementFromPoint(x, y)
          const who = owner(hit)
          if (who === el) continue
          // Another control may sit right next to this one (a chip's toggle and its remove button):
          // a tap on its *drawn* box is legitimately its own. Any other hit is a hole in the region.
          if (who) {
            const v = visualOf(who).getBoundingClientRect()
            if (x >= v.left && x <= v.right && y >= v.top && y <= v.bottom) continue
          }
          misses.push(`${side} -> ${hit ? hit.tagName.toLowerCase() + '.' + [...hit.classList].join('.') : 'nothing'}`)
        }
        const label = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" in ${el.closest('[data-group]')?.getAttribute('data-group') ?? '?'}`
        const v = visualOf(el).getBoundingClientRect()
        out.push({ label, w: Math.round(v.width * 10) / 10, h: Math.round(v.height * 10) / 10, misses })
      }
      return out
    },
    { controls: CONTROLS, selector: SELECTOR, target: TARGET },
  )
}

async function openWith(browser: Browser, touch: boolean): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: touch,
    isMobile: touch,
    baseURL: 'http://127.0.0.1:4318/',
  })
  const page = await context.newPage()
  await openGallery(page, 'fleet', 'reduced', 390)
  return page
}

test('every interactive .ui-* control has a 44x44 hit region on a coarse pointer, at its desktop drawn size', async ({ browser }) => {
  const touch = await openWith(browser, true)
  expect(await touch.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
  const coarse = await probe(touch)
  expect(coarse.length).toBeGreaterThan(80)
  const holes = coarse.filter((p) => p.misses.length > 0).map((p) => `${p.label}: ${p.misses.join(', ')}`)
  expect(holes, holes.join('\n')).toEqual([])

  const mouse = await openWith(browser, false)
  expect(await mouse.evaluate(() => matchMedia('(pointer: fine)').matches)).toBe(true)
  const fine = await probe(mouse)
  expect(fine.map((p) => p.label)).toEqual(coarse.map((p) => p.label))
  // Text inputs deliberately grow from 40 to 44px on touch (iOS text-field height); everything else
  // keeps its drawn size.
  // Text inputs, tabs and the gallery's own chrome deliberately grow to 44px rows on touch;
  // every other control keeps its drawn size.
  const grows = /^(input|select)\.ui-input|ui-tabs__tab|\.g-|^summary| in \?$/
  const resized = coarse
    .map((p, i) => ({ p, f: fine[i]! }))
    .filter(({ p, f }) => !grows.test(p.label) && (p.w !== f.w || p.h !== f.h))
    .map(({ p, f }) => `${p.label}: ${f.w}x${f.h} -> ${p.w}x${p.h}`)
  expect(resized, resized.join('\n')).toEqual([])
})
