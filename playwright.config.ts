import { defineConfig, devices } from '@playwright/test'

// Gallery visual regression + axe (spec §10.6, §10.7). Local Chromium only; no cloud services.
// Baselines live per platform: they were recorded on macOS, and fonts rasterize differently
// elsewhere, so CI (Linux) runs the axe spec only.
export default defineConfig({
  testDir: 'gallery/tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  fullyParallel: true,
  // Local gates share this Mac with other sessions; at the default worker count, 2 of 96 baseline
  // runs timed out waiting for "element stable" under load (2026-10-11). Four workers and a 15s
  // expect timeout keep the gate deterministic; CI keeps Playwright's default.
  workers: process.env.CI ? undefined : 4,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: 'http://127.0.0.1:4318/',
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 } }],
  webServer: {
    command: 'npx vite preview --config gallery/vite.config.ts --host 127.0.0.1',
    url: 'http://127.0.0.1:4318/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
