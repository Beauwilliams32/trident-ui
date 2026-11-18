import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { openGallery } from './matrix'

/**
 * Keyboard journeys through the @trident/ui/app overlays (G7; spec §9 "Escape closes overlays and
 * returns focus", §10.8): open each from its trigger with the keyboard, check axe with it open,
 * close it with Escape and check focus is back on the trigger. One dark and one light theme.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']

const OVERLAYS = [
  { trigger: 'Edit profile', role: 'dialog' as const, name: 'Edit profile' },
  { trigger: 'Delete post', role: 'alertdialog' as const, name: 'Delete this post?', firstFocus: 'Cancel' },
  { trigger: 'Open filters', role: 'dialog' as const, name: 'Filters' },
  { trigger: 'Share', role: 'dialog' as const, name: 'Share' },
  { trigger: 'Post actions', role: 'menu' as const, name: 'Post actions' },
  { trigger: 'Open command palette (Ctrl+K)', role: 'dialog' as const, name: 'Command palette' },
]

async function axeClean(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const summary = violations.map((v) => `${v.id}: ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(' ')}`)
  expect(summary, `${label}\n${summary.join('\n')}`).toEqual([])
}

const focusedName = (page: Page) => page.evaluate(() => (document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '').trim())

for (const theme of ['fleet', 'wmh-portal'] as const) {
  test.describe(`keyboard ${theme}`, () => {
    for (const o of OVERLAYS)
      test(`${o.trigger}: Enter opens a ${o.role}, axe is clean, Escape closes and focus returns`, async ({ page }) => {
        await openGallery(page, theme, 'reduced', 1280)
        const app = page.locator('section[data-group="app"]')
        const trigger = app.getByRole('button', { name: o.trigger, exact: true })
        await trigger.focus()
        await page.keyboard.press('Enter')
        const overlay = page.getByRole(o.role, { name: o.name })
        await expect(overlay).toBeVisible()
        if (o.firstFocus) expect(await focusedName(page)).toBe(o.firstFocus)
        else expect(await overlay.evaluate((el) => el.contains(document.activeElement))).toBe(true)
        await axeClean(page, `${o.trigger} open`)
        await page.keyboard.press('Escape')
        await expect(overlay).toBeHidden()
        await expect(trigger).toBeFocused()
      })

    test('Tooltip shows on focus, Escape hides it and focus stays', async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)
      const button = page.locator('section[data-group="app"]').getByRole('button', { name: 'Archive', exact: true })
      // Return to the trigger with a real Tab after Shift+Tab settles the focus-open tooltip.
      await button.focus()
      await page.keyboard.press('Shift+Tab')
      await expect(button).toHaveAttribute('data-state', 'closed')
      await page.keyboard.press('Tab')
      await expect(button).toBeFocused()
      await expect(button).toHaveAttribute('data-state', 'instant-open')
      await expect(button).toHaveAttribute('aria-describedby', /.+/)
      const tip = page.getByRole('tooltip')
      await expect(tip).toHaveText('Archive')
      await page.keyboard.press('Escape')
      await expect(tip).toBeHidden()
      await expect(button).toBeFocused()
    })

    test('Tabs: one tab stop, arrows move and select', async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)
      const list = page.getByRole('tablist', { name: 'Client' })
      await list.getByRole('tab', { name: 'Overview' }).focus()
      await page.keyboard.press('ArrowRight')
      const billing = list.getByRole('tab', { name: 'Billing' })
      await expect(billing).toBeFocused()
      await expect(billing).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByRole('tabpanel', { name: 'Billing' })).toHaveText('Invoices and the card on file.')
    })

    test('ContextMenu opens on the context-menu gesture and Escape closes it', async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)
      const area = page.locator('#ex-app-context-menu .g-body').getByText('Right-click (or Shift+F10) this card')
      await area.click({ button: 'right' })
      const menu = page.getByRole('menu', { name: 'Card actions' })
      await expect(menu).toBeVisible()
      await expect(menu.getByRole('menuitem')).toHaveCount(3)
      await page.keyboard.press('Escape')
      await expect(menu).toBeHidden()
    })

    test('Ctrl+K opens the command palette, typing filters, Escape returns focus', async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)
      const before = page.locator('section[data-group="app"]').getByRole('button', { name: 'Edit profile', exact: true })
      await before.focus()
      await page.keyboard.press('Control+k')
      const dialog = page.getByRole('dialog', { name: 'Command palette' })
      await expect(dialog).toBeVisible()
      await page.keyboard.type('settings')
      await expect(dialog.getByRole('option')).toHaveText(['Open settings'])
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(before).toBeFocused()
    })

    test('DataTable sorts from the keyboard in three states', async ({ page }) => {
      await openGallery(page, theme, 'reduced', 1280)
      const table = page.getByRole('table', { name: 'Clients (sample data)' })
      const header = table.getByRole('columnheader', { name: 'Posts' })
      await header.getByRole('button').focus()
      const firstClient = () => table.getByRole('rowheader').first().textContent()
      await page.keyboard.press('Enter')
      await expect(header).toHaveAttribute('aria-sort', 'ascending')
      expect(await firstClient()).toBe('Pine Dental')
      await page.keyboard.press('Enter')
      await expect(header).toHaveAttribute('aria-sort', 'descending')
      expect(await firstClient()).toBe('Harbor Coffee')
      await page.keyboard.press('Enter')
      await expect(header).toHaveAttribute('aria-sort', 'none')
    })
  })
}
