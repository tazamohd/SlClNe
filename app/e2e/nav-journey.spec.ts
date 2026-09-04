/** The journey-ordered sidebar, as rendered.
 *
 *  `tests/unit/nav-contract.test.ts` pins the data; this pins what a user
 *  sees: groups in the order of the working day, the fold state surviving a
 *  navigation, the current group unfolding on arrival, the filter narrowing
 *  the tree, and a technician never seeing the accounting group. */
import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

const JOURNEY = ['today', 'front-desk', 'workshop', 'parts', 'billing', 'accounting']

test.describe('journey sidebar', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 860, 'desktop project only')

  test('owner sees the groups in journey order', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')
    const ids = await page.locator('[data-testid^="nav-group-"]').evaluateAll((nodes) =>
      nodes.map((n) => (n.getAttribute('data-testid') ?? '').replace('nav-group-', ''))
    )
    const seen = JOURNEY.map((slug) => ids.indexOf(slug))
    expect(seen.every((i) => i >= 0)).toBe(true)
    expect([...seen].sort((a, b) => a - b)).toEqual(seen)
    await ctx.close()
  })

  test('technician has no accounting group and no Accounting text', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'technician')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')
    if ((await page.locator('aside').count()) > 0) {
      await expect(page.getByTestId('nav-group-accounting')).toHaveCount(0)
      expect((await page.locator('aside').innerText()).toUpperCase()).not.toContain('ACCOUNTING')
    }
    await ctx.close()
  })

  test('a folded group stays folded across navigation and unfolds when its route is opened', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')
    const billing = page.getByTestId('nav-group-billing')
    await billing.click()
    await expect(billing).toHaveAttribute('aria-expanded', 'false')
    await page.getByTestId('nav-item-job-cards').click()
    await page.waitForURL('**/job-cards**')
    await expect(page.getByTestId('nav-group-billing')).toHaveAttribute('aria-expanded', 'false')
    await gotoReady(page, '/invoices')
    await expect(page.getByTestId('nav-group-billing')).toHaveAttribute('aria-expanded', 'true')
    await ctx.close()
  })

  test('the filter narrows the tree to matching items', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')
    await page.getByPlaceholder('Filter navigation').fill('invoice')
    await expect(page.getByTestId('nav-item-invoices')).toBeVisible()
    await expect(page.getByTestId('nav-item-job-cards')).toHaveCount(0)
    await ctx.close()
  })
})
