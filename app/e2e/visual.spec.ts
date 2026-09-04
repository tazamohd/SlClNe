/** Visual regression for the hero routes.
 *
 *  Opt-in (`VISUAL=1`), because snapshots must be generated on the CI Linux
 *  image — font rasterisation differs on Windows and macOS, and a snapshot
 *  taken locally would fail everywhere else. First run on the image:
 *  `VISUAL=1 npx playwright test e2e/visual.spec.ts --update-snapshots`. */
import { test, expect } from '@playwright/test'
import { seedRole, seedPrefs, gotoReady, HERO_ROUTES } from './helpers'

test.describe('visual', () => {
  test.skip(!process.env.VISUAL, 'set VISUAL=1 on the CI image to run the screenshot sweep')
  test.use({ reducedMotion: 'reduce' })

  for (const route of HERO_ROUTES) {
    for (const theme of ['light', 'dark'] as const) {
      for (const lang of ['en', 'ar'] as const) {
        test(`${route} ${theme} ${lang}`, async ({ browser, viewport }) => {
          const ctx = await browser.newContext({ viewport: viewport ?? { width: 1440, height: 900 } })
          await seedRole(ctx, 'owner')
          await seedPrefs(ctx, { theme, lang })
          const page = await ctx.newPage()
          await gotoReady(page, route)
          await page.waitForFunction(() => document.fonts.status === 'loaded')
          await expect(page).toHaveScreenshot(
            `${route.replace(/\W+/g, '_').replace(/^_/, '')}-${theme}-${lang}-${viewport?.width ?? 1440}.png`,
            { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.01, mask: [page.getByTestId('toast-queue')] }
          )
          await ctx.close()
        })
      }
    }
  }
})
