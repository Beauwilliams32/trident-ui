import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { loadTokens } from '../../scripts/lib/tokens.mjs'
import { componentApis } from '../data/props'
import { openGallery, THEMES, WIDTHS } from './matrix'

/**
 * Measured quality checks from the 2026-10-11 review (QUALITY-REVIEW.md G1-G19), in the real
 * browser, in every theme. Each block names the gap it closes.
 */
const ROOT = join(import.meta.dirname, '../..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }
const tokens = loadTokens()

/** Computed colour of `value` (e.g. "var(--ui-accent-text)") in the context of `el`'s parent. */
async function resolvedColors(page: Page, selector: string, values: string[]) {
  return page.locator(selector).evaluateAll((els, vals) => {
    return els.map((el) => {
      const probes = vals.map((v) => {
        const s = document.createElement('span')
        s.style.color = v
        el.parentElement!.appendChild(s)
        const c = getComputedStyle(s).color
        s.remove()
        return c
      })
      return { text: (el.textContent ?? '').trim(), color: getComputedStyle(el).color, allowed: probes }
    })
  }, values)
}

for (const theme of THEMES) {
  test.describe(`measure ${theme}`, () => {
    test(`G1 links take the theme colour, G2 no unstyled buttons, G10 chip insets, G16 tone bands (${theme})`, async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)

      // G1: every link inside Alert actions, Toast and FlashBanner, and every ViewTransitionLink.
      const links = await resolvedColors(
        page,
        '.ui-alert__actions a:not(.ui-btn), .ui-toast a:not(.ui-btn), .ui-flash a:not(.ui-btn), section[data-group="motion"] a.ui-link',
        ['var(--ui-accent-text)', 'var(--ui-tone-ink)'],
      )
      expect(links.length).toBeGreaterThanOrEqual(2)
      for (const l of links) expect(l.allowed, `"${l.text}" is ${l.color}`).toContain(l.color)
      const vtl = await page.locator('section[data-group="motion"] a.ui-link').count()
      expect(vtl, 'ViewTransitionLink renders .ui-link').toBeGreaterThanOrEqual(1)

      // G2: the showcase never shows a bare browser button.
      expect(await page.locator('.g-example button:not([class])').count()).toBe(0)

      // G10: a static chip's label sits centred: start and end insets equal within 1px.
      const insets = await page.locator('section[data-group="display"] .ui-chip:not(:has(button))').evaluateAll((chips) =>
        chips.map((chip) => {
          const label = chip.querySelector('.ui-chip__label')!
          const range = document.createRange()
          range.selectNodeContents(label)
          const t = range.getBoundingClientRect()
          const c = chip.getBoundingClientRect()
          const bw = parseFloat(getComputedStyle(chip).borderInlineStartWidth)
          return { text: label.textContent, start: t.left - c.left - bw, end: c.right - t.right - bw, rtl: getComputedStyle(chip).direction === 'rtl' }
        }),
      )
      expect(insets.length).toBeGreaterThanOrEqual(2)
      for (const i of insets) expect(Math.abs(i.start - i.end), `${i.text}: ${i.start.toFixed(1)} vs ${i.end.toFixed(1)}`).toBeLessThanOrEqual(1)

      // G16: the default and alt Section bands are told apart (different luminance) on a neutral frame.
      const lum = await page.locator('#ex-layout-section .ui-section').evaluateAll((bands) =>
        bands.map((b) => {
          let el: Element | null = b
          let bg = 'rgba(0, 0, 0, 0)'
          while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
            bg = getComputedStyle(el).backgroundColor
            el = el.parentElement
          }
          const [r, g, b2] = bg.match(/[\d.]+/g)!.map(Number).map((v) => v / 255)
          const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
          return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b2!)
        }),
      )
      expect(lum).toHaveLength(3)
      expect(Math.abs(lum[0]! - lum[1]!), `default ${lum[0]} vs alt ${lum[1]}`).toBeGreaterThan(0)
    })

    test(`G4 docs layer, G8 tokens, G13 brand, G17 chrome, G19 RTL (${theme})`, async ({ page }) => {
      const bad: string[] = []
      page.on('response', (r) => {
        if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`)
      })
      await openGallery(page, theme, 'reduced', 1280)

      // G17: no failed request (favicon included) and the version links to the changelog.
      expect(bad).toEqual([])
      await expect(page.locator('.g-version')).toHaveText(new RegExp(`^v${pkg.version.replace(/\./g, '\\.')}`))
      expect(await page.locator('.g-version').getAttribute('href')).toMatch(/CHANGELOG\.md$/)
      expect(await page.locator('link[rel="icon"]').getAttribute('href')).toMatch(/^data:image\/svg\+xml/)

      // G4: every component example has a description and a Code disclosure with a copy button.
      const examples = await page.locator('section[data-group] .g-example').evaluateAll((els) =>
        els
          .filter((el) => !['getting-started', 'tokens', 'brand'].includes(el.closest('section')!.getAttribute('data-group')!))
          .map((el) => ({ id: el.id, desc: Boolean(el.querySelector(':scope > .g-desc')?.textContent?.trim()), code: Boolean(el.querySelector(':scope > details.g-code .ui-code-block')), copy: Boolean(el.querySelector(':scope > details.g-code .g-copy')) })),
      )
      expect(examples.length).toBeGreaterThan(70)
      for (const e of examples) expect(e, e.id).toEqual({ id: e.id, desc: true, code: true, copy: true })

      // G4: a generated props table for every component in the root entry (and /app, /marketing).
      const names = componentApis(ROOT).map((a) => a.name)
      const rendered = await page.locator('.g-api__component').evaluateAll((els) => els.map((e) => e.querySelector('code')!.textContent))
      expect(rendered.sort()).toEqual([...names].sort())

      // G8: a row for every colour role of this theme, each with a value.
      const roles = await page.locator('section[data-group="tokens"] [data-role]').evaluateAll((els) => els.map((e) => e.getAttribute('data-role')))
      expect(new Set(roles)).toEqual(new Set(tokens.roles))

      // G13: the tile at six sizes, the lockup, the supplied lockups and 1200 x 630 card, every icon
      // file loaded, and the legacy contour hero.
      const brand = page.locator('section[data-group="brand"]')
      expect(await brand.locator('.g-tiles .g-mark img').count()).toBe(6)
      expect(await brand.locator('.g-lockup .g-mark img').count()).toBe(1)
      expect(await brand.locator('[data-brand-file]').evaluateAll((els) => els.map((e) => e.getAttribute('data-brand-file')))).toEqual(['lockup-dark.svg', 'lockup-light.svg', 'og-card.png'])
      expect(await brand.locator('tr[data-icon-file]').count()).toBe(10)
      await expect
        .poll(() => brand.locator('img').evaluateAll((els) => els.filter((el) => !(el as HTMLImageElement).complete || (el as HTMLImageElement).naturalWidth === 0).length), { message: 'brand images that failed to load' })
        .toBe(0)
      const card = await brand.locator('[data-brand-file="og-card.png"] img').evaluate((el) => [(el as HTMLImageElement).naturalWidth, (el as HTMLImageElement).naturalHeight])
      expect(card, 'og-card.png is 1200 x 630').toEqual([1200, 630])
      expect(await brand.locator('.trident-depth-line').count()).toBe(1)

      // G19: right-to-left examples for forms, chips, alerts and toasts.
      for (const g of ['forms', 'display', 'feedback']) expect(await page.locator(`section[data-group="${g}"] [dir="rtl"]`).count(), g).toBeGreaterThanOrEqual(1)
      expect(await page.locator('section[data-group="feedback"] [dir="rtl"] .ui-toast').count()).toBe(1)
    })

    for (const width of WIDTHS)
      test(`G11 the procedural poster fades out before every edge (${theme} ${width})`, async ({ page }) => {
        await openGallery(page, theme, 'reduced', width)
        const poster = page.locator('#ex-three-poster-procedural .ui-poster--procedural')
        await poster.scrollIntoViewIfNeeded()
        const png = (await poster.screenshot()).toString('base64')
        const base = await poster.evaluate((el) => getComputedStyle(el).backgroundColor)
        const worst = await page.evaluate(
          async ({ png, base }) => {
            const img = new Image()
            img.src = `data:image/png;base64,${png}`
            await img.decode()
            const c = document.createElement('canvas')
            c.width = img.width
            c.height = img.height
            const ctx = c.getContext('2d')!
            ctx.drawImage(img, 0, 0)
            const { data } = ctx.getImageData(0, 0, c.width, c.height)
            const lab = (r: number, g: number, b: number) => {
              const f = (v: number) => {
                const s = v / 255
                return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
              }
              const [R, G, B] = [f(r), f(g), f(b)]
              const xyz = [(0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, 0.2126 * R + 0.7152 * G + 0.0722 * B, (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883]
              const t = xyz.map((v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116))
              return [116 * t[1]! - 16, 500 * (t[0]! - t[1]!), 200 * (t[1]! - t[2]!)]
            }
            const [br, bg, bb] = base.match(/[\d.]+/g)!.map(Number)
            const ref = lab(br!, bg!, bb!)
            let max = 0
            for (let y = 0; y < c.height; y++)
              for (let x = 0; x < c.width; x++) {
                if (x >= 2 && x < c.width - 2 && y >= 2 && y < c.height - 2) continue
                const i = (y * c.width + x) * 4
                const l = lab(data[i]!, data[i + 1]!, data[i + 2]!)
                max = Math.max(max, Math.hypot(l[0]! - ref[0]!, l[1]! - ref[1]!, l[2]! - ref[2]!))
              }
            return max
          },
          { png, base },
        )
        expect(worst, `outer 2px ring vs ${base}: max ΔE ${worst.toFixed(2)}`).toBeLessThan(2)
      })
  })
}

test.describe('navigation and chrome', () => {
  test('G9 theme and motion links keep ?group= and the #hash', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
    await page.goto('./?theme=fleet&motion=reduced&group=forms#ex-forms-errors')
    await page.locator('html[data-gallery-ready]').waitFor({ state: 'attached' })
    expect(await page.locator('nav[aria-label="Theme"] a', { hasText: 'trident-ops' }).getAttribute('href')).toBe('?theme=trident-ops&motion=reduced&group=forms#ex-forms-errors')
    expect(await page.locator('nav[aria-label="Motion"] a', { hasText: 'Paused' }).getAttribute('href')).toBe('?theme=fleet&motion=paused&group=forms#ex-forms-errors')
    await page.evaluate(() => {
      window.location.hash = '#ex-forms-rtl'
    })
    await expect(page.locator('nav[aria-label="Theme"] a', { hasText: 'wmh-portal' })).toHaveAttribute('href', '?theme=wmh-portal&motion=reduced&group=forms#ex-forms-rtl')
    // Following a theme link lands on the same group with the same hash.
    await page.locator('nav[aria-label="Theme"] a', { hasText: 'wmh-portal' }).click()
    await page.locator('html[data-gallery-ready]').waitFor({ state: 'attached' })
    expect(new URL(page.url()).search).toBe('?theme=wmh-portal&motion=reduced&group=forms')
    expect(new URL(page.url()).hash).toBe('#ex-forms-rtl')
    await expect(page.locator('section[data-group]')).toHaveCount(1)
  })

  test('G9 readable section titles, a sticky list on desktop and a "Jump to" menu on phones (no JS needed)', async ({ page }) => {
    await openGallery(page, 'fleet', 'reduced', 1280)
    const titles = await page.locator('section[data-group] > .g-group__head > h2').allTextContents()
    for (const raw of ['a11y', 'motion-lite', 'type']) expect(titles).not.toContain(raw)
    expect(titles).toContain('Accessibility')
    await expect(page.locator('nav.g-toc')).toBeVisible()
    expect(await page.locator('nav.g-toc').evaluate((el) => getComputedStyle(el).position)).toBe('sticky')
    await expect(page.locator('details.g-jump')).toBeHidden()
    // Section links are plain anchors.
    const hrefs = await page.locator('nav.g-toc a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    for (const h of hrefs) expect(h).toMatch(/^#group-/)
    await page.locator('nav.g-toc a', { hasText: 'Forms' }).click()
    await expect(page).toHaveURL(/#group-forms$/)
    expect(await page.locator('#group-forms').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(40)

    await openGallery(page, 'fleet', 'reduced', 360)
    await expect(page.locator('nav.g-toc')).toBeHidden()
    await expect(page.locator('details.g-jump')).toBeVisible()
    await page.locator('details.g-jump > summary').click()
    await page.locator('details.g-jump a', { hasText: 'Feedback' }).click()
    await expect(page).toHaveURL(/#group-feedback$/)
  })

  test('G18 every chrome link and summary is at least 24px tall', async ({ page }) => {
    for (const width of WIDTHS) {
      await openGallery(page, 'fleet', 'reduced', width)
      const small = await page
        .locator('.g-head a, .g-toc a, .g-jump > summary, .g-code > summary, .g-api > summary')
        .evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 24).map((e) => `${e.textContent} ${e.getBoundingClientRect().height}`))
      expect(small, `${width}px`).toEqual([])
    }
  })

  test('G3 the install snippet names the package.json version and scrolls instead of wrapping', async ({ page }) => {
    await openGallery(page, 'fleet', 'reduced', 360)
    const block = page.locator('#ex-type-mono-code-kbd .g-body .ui-code-block')
    await expect(block).toHaveText(`npm install --allow-git=all github:Beauwilliams32/trident-ui#v${pkg.version}`)
    const m = await block.evaluate((el) => ({ ws: getComputedStyle(el).whiteSpace, ox: getComputedStyle(el).overflowX, lines: Math.round(el.querySelector('code')!.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)) }))
    expect(m).toEqual({ ws: 'pre', ox: 'auto', lines: 1 })
  })
})
