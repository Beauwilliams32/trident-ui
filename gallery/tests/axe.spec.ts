import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { MOTION, openGallery, THEMES, WIDTHS } from './matrix'

// WCAG 2.2 AA (spec §9, §10.7): zero violations over the whole gallery, in every theme, under
// both motion states and both widths.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']

for (const theme of THEMES)
  for (const motion of MOTION)
    for (const width of WIDTHS)
      test(`axe ${theme} ${motion} ${width}`, async ({ page }) => {
        await openGallery(page, theme, motion, width)
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(' ')} — ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`)
        expect(summary, summary.join('\n')).toEqual([])
      })
