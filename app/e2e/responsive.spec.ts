import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

test.describe('Mobile responsiveness', () => {
  test('job cards render as cards (not table) at 390px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/job-cards')
    const tables = await page.locator('table').count()
    expect(tables).toBe(0)
    const menu = await page.getByRole('button', { name: 'Open menu' }).count()
    expect(menu).toBeGreaterThan(0)
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)
    await ctx.close()
  })

  test('customer app shell renders at 430px with bottom tab bar', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-app/home')
    const sidebar = await page.locator('aside').count()
    expect(sidebar).toBe(0)
    const tabs = await page.getByRole('navigation').count()
    expect(tabs).toBeGreaterThan(0)
    const width = await page.evaluate(() => {
      const main = document.querySelector('main')
      return main ? main.getBoundingClientRect().width : 0
    })
    expect(width).toBeLessThanOrEqual(431)
    await ctx.close()
  })
})

test.describe('Language and RTL', () => {
  /** The Arabic dictionary is a lazy chunk, and the switch waits for it so the
   *  direction and the words change together rather than mirroring the layout
   *  around English text. That makes the click asynchronous by design, so both
   *  assertions here poll instead of reading once: a snapshot taken in the same
   *  tick as the click is measuring the download, not the behaviour. */
  test('switching to Arabic sets RTL direction and Arabic copy together', async ({ page }) => {
    await gotoReady(page, '/language-selection')
    await page.getByRole('button', { name: /Arabic|العربية/ }).click()

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('body')).toContainText('اختر لغتك')

    // The pairing is the point: RTL never lands on untranslated English.
    const flashedEnglish = await page.evaluate(
      () =>
        document.documentElement.dir === 'rtl' &&
        document.body.innerText.includes('Choose your language'),
    )
    expect(flashedEnglish).toBe(false)
  })
})
