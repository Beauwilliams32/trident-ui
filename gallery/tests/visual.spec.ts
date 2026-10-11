import { expect, test } from '@playwright/test'
import { MOTION, openGallery, THEMES, WIDTHS } from './matrix'

// One screenshot per group section, per theme × motion state × width. Run `npm run gallery:update`
// to re-record after an intended visual change; every visual final still goes through the
// owner's creative review gate.
// Baselines are recorded in local Chromium on macOS (fonts rasterize differently elsewhere).
test.skip(process.platform !== 'darwin', 'visual baselines are recorded on macOS; CI runs the axe spec')

const NOT_SNAPSHOTTED = new Set(['getting-started', 'tokens'])

for (const theme of THEMES)
  for (const motion of MOTION)
    for (const width of WIDTHS)
      test(`visual ${theme} ${motion} ${width}`, async ({ page }) => {
        await openGallery(page, theme, motion, width)
        // 3D is snapshotted only through its poster: no WebGL canvas may exist (spec §6.4, §10.6).
        await expect(page.locator('canvas')).toHaveCount(0)
        await expect(page.locator('[data-poster]').first()).toBeVisible()
        const groups = await page.locator('section[data-group]').evaluateAll((els) => els.map((e) => e.getAttribute('data-group')!))
        expect(groups.length).toBeGreaterThanOrEqual(17)
        for (const g of groups) {
          // Text-only documentation: the install and token tables are checked by measure.spec.ts and
          // the contrast matrix, not by pixels (docs/DEVIATIONS.md, 2026-10-11).
          if (NOT_SNAPSHOTTED.has(g)) continue
          await expect.soft(page.locator(`section[data-group="${g}"]`)).toHaveScreenshot(`${theme}/${motion}-${width}-${g}.png`)
        }
      })
