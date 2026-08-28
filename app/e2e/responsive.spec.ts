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
  test('switching to Arabic sets RTL direction', async ({ page }) => {
    await gotoReady(page, '/language-selection')
    await page.getByRole('button', { name: /Arabic|العربية/ }).click()
    const dir = await page.evaluate(() => document.documentElement.dir)
    expect(dir).toBe('rtl')
    const text = await page.locator('body').innerText()
    expect(text).toContain('اختر لغتك')
  })
})
