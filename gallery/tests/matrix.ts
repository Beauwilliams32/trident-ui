import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, type Page } from '@playwright/test'
import { THEME_SCHEMES, type ThemeName } from '../../src/server/themes'

/**
 * The gallery matrix (spec §10.6). Every theme ships in exactly one native scheme (fleet light is
 * deferred, spec §0.2; wmh-portal is the light theme), so "light/dark where applicable" is each
 * theme in its own scheme. Motion: OS reduced-motion, and the persistent Pause control.
 */
export const THEMES = Object.keys(THEME_SCHEMES) as ThemeName[]
export const MOTION = ['reduced', 'paused'] as const
export const WIDTHS = [360, 1280] as const
export type Motion = (typeof MOTION)[number]

/** Open the gallery in a fixed, animation-free state and wait for fonts and motion-lite. */
export async function openGallery(page: Page, theme: ThemeName, motion: Motion, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 900 })
  await page.emulateMedia({ reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference', colorScheme: THEME_SCHEMES[theme] })
  await page.goto(`./?theme=${theme}&motion=${motion}`)
  await page.locator('html[data-gallery-ready]').waitFor({ state: 'attached' })
  await page.evaluate(() => document.fonts.ready)
  // The motion kill switch gives every element `transition-duration: 0.01ms` with the default
  // `transition-property: all`, so a late theme-dependent style change eases colour over one frame,
  // and axe can sample inside that frame (seen 2026-10-02: wmh-portal paused, ink #e9f2fb on
  // #f1f5fb, about 1 run in 100). Wait two frames, then until no CSS transition is running.
  await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))))
  await page.waitForFunction(() => !document.getAnimations().some((a) => a instanceof CSSTransition && a.playState === 'running'))
  // Guard against cascade-order regressions: the theme file's own values must be the ones in effect.
  const expected = themeVars(theme)
  const actual = await page.evaluate(
    (names) => names.map((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()),
    Object.keys(expected),
  )
  expect(actual).toEqual(Object.values(expected))
}

/** --ui-bg and --ui-accent-1 as declared in dist/themes/<theme>.css. */
function themeVars(theme: ThemeName): Record<string, string> {
  const css = readFileSync(join(import.meta.dirname, '../../dist/themes', `${theme}.css`), 'utf8')
  const out: Record<string, string> = {}
  for (const name of ['--ui-bg', '--ui-accent-1']) {
    const m = new RegExp(`${name}:\\s*([^;]+);`).exec(css)
    if (m?.[1]) out[name] = m[1].trim()
  }
  return out
}
