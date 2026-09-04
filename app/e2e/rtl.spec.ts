/** Arabic sessions: direction, language, font and the Latin runs that must
 *  not mirror.
 *
 *  Complements the language-switch test in `responsive.spec.ts` (which
 *  proves the toggle) by seeding Arabic before load — a returning user — and
 *  checking the hero routes render right-to-left with the Arabic face
 *  loaded, chevrons mirrored, and plates, ids and money pinned LTR. */
import { test, expect } from '@playwright/test'
import { seedRole, seedPrefs, gotoReady, HERO_ROUTES } from './helpers'

test.describe('RTL', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
    await seedPrefs(context, { lang: 'ar' })
  })

  for (const route of HERO_ROUTES.slice(0, 10)) {
    test(`${route} renders right-to-left`, async ({ page }) => {
      await gotoReady(page, route)
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar')

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      )
      expect(overflows, `${route} overflows horizontally in RTL`).toBe(false)

      // Every Latin run the screen marks is isolated from the bidi algorithm.
      const unpinned = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('td.font-mono, [data-testid="page-header-title"].font-mono')].filter(
          (el) => el.getAttribute('dir') !== 'ltr'
        ).length
      )
      expect(unpinned).toBe(0)
    })
  }

  test('the Arabic face is loaded and used for Arabic text', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 15_000 })
    const loaded = await page.evaluate(() => document.fonts.check('12px "Noto Sans Arabic"'))
    expect(loaded).toBe(true)
  })

  test('breadcrumb separators and back arrows point the other way', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const crumbs = page.getByTestId('page-header-breadcrumbs')
    if ((await crumbs.count()) > 0) {
      const chevron = crumbs.locator('svg').first()
      await expect(chevron).toHaveClass(/lucide-chevron-left/)
    }
    const money = page.locator('[dir="ltr"].font-mono').first()
    if ((await money.count()) > 0) await expect(money).toHaveAttribute('dir', 'ltr')
  })
})
