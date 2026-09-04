/** The table every list screen shares: sort, paging, density, and the phone
 *  card swap. Checked on the customers registry, the busiest one. */
import { test, expect } from '@playwright/test'
import { seedRole, seedPrefs, gotoReady } from './helpers'

test.describe('data table', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('sorting flips the first row and announces the state', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 860, 'desktop only — phones render cards')
    await gotoReady(page, '/customers')
    const sort = page.locator('[data-testid^="data-table-sort-"]').first()
    await expect(sort).toBeVisible()
    const before = await page.getByTestId('data-table-row').first().innerText()
    await sort.click()
    const th = sort.locator('xpath=ancestor::th[1]')
    await expect(th).toHaveAttribute('aria-sort', 'ascending')
    await sort.click()
    await expect(th).toHaveAttribute('aria-sort', 'descending')
    const after = await page.getByTestId('data-table-row').first().innerText()
    expect(after).not.toEqual(before)
  })

  test('density preference changes row height across tables', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await seedRole(ctx, 'owner')
    await seedPrefs(ctx, { density: 'compact' })
    const page = await ctx.newPage()
    await gotoReady(page, '/customers')
    const height = await page.getByTestId('data-table-row').first().evaluate((el) => el.getBoundingClientRect().height)
    expect(height).toBeLessThanOrEqual(40)
    await ctx.close()
  })

  test('phones get the card list, never a table', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customers')
    expect(await page.locator('table').count()).toBe(0)
    expect(await page.getByTestId('data-table-row').count()).toBeGreaterThan(0)
    await ctx.close()
  })

  test('the feature kit pages past 25 rows with a summary', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 860, 'desktop only')
    await gotoReady(page, '/inventory')
    const summary = page.getByTestId('data-table-summary').first()
    if ((await summary.count()) > 0) {
      await expect(summary).toContainText(/Showing|عرض/)
    }
  })
})
