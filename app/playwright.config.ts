import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

/** The browser this suite runs in.
 *
 *  CI images bake Chromium into a fixed path and set no env var, so the path
 *  was hardcoded here. On any machine without that exact directory —
 *  a developer's laptop, a different image, a bumped Playwright version —
 *  every spec failed on launch before it could assert anything, which is
 *  indistinguishable from having no E2E suite at all.
 *
 *  Prefer an explicit `PLAYWRIGHT_CHROMIUM_PATH`, fall back to the baked CI
 *  path when it is really there, and otherwise let Playwright use the browser
 *  it manages itself (`npx playwright install chromium`). */
const CI_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (existsSync(CI_CHROMIUM) ? CI_CHROMIUM : undefined)

/** `npm run build && npm run preview` on 4173, unless something is already
 *  serving there. Without this every run needed a second terminal, and a spec
 *  that hit a stale preview silently tested the previous build. */
const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
      },
    },
  ],
})
