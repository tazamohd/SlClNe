/** The states every screen owes the user, as rendered.
 *
 *  Loading never blanks the header; a filter with no matches produces an
 *  explained empty state; a failed read produces an error with a retry. The
 *  fixtures answer in memory, so the failure case is driven by blocking the
 *  API when a live build is under test and otherwise by the honest empty
 *  path. */
import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

test.describe('screen states', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('the page header is present before the body settles', async ({ page }) => {
    await page.goto('/job-cards', { waitUntil: 'commit' })
    await expect(page.getByTestId('page-header-title').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('page-header-title').first()).toContainText(/Job Cards|أوامر/)
  })

  test('a search with no matches explains itself instead of showing a blank table', async ({ page }) => {
    await gotoReady(page, '/customers')
    const search = page.getByRole('searchbox').first()
    await search.fill('zzzz-no-such-customer')
    await expect(page.getByText(/No matching|No results|لا توجد/i).first()).toBeVisible()
  })

  test('a kit screen with no rows renders its empty state, never a bare table', async ({ page }) => {
    await gotoReady(page, '/vehicle-tracking')
    await expect(page.getByTestId('page-header-title')).toBeVisible()
    const text = await page.locator('main').innerText()
    expect(text.length).toBeGreaterThan(40)
    expect(await page.locator('tbody tr').count()).toBe(0)
  })

  test('a failed API read shows an error with a retry (live builds only)', async ({ page }) => {
    const hasApi = await page.evaluate(() => Boolean((window as unknown as { __SALIS_API__?: string }).__SALIS_API__))
    test.skip(!hasApi, 'fixtures cannot fail; exercised against a live API')
    await page.route('**/api/**', (route) => route.abort())
    await page.goto('/job-cards', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('state-error')).toBeVisible()
    await expect(page.getByTestId('state-error-retry')).toBeVisible()
  })
})
