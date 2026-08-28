import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Invoices and finance', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('invoices list loads', async ({ page }) => {
    await gotoReady(page, '/invoices')
    const text = await bodyText(page)
    expect(text).toContain('Invoices')
  })

  test('invoice detail loads with line items', async ({ page }) => {
    await gotoReady(page, '/invoice-detail')
    const text = await bodyText(page)
    expect(text).toContain('Line items')
  })

  test('invoice create recomputes total when line removed', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'accountant')
    const page = await ctx.newPage()
    await gotoReady(page, '/invoice-create')
    const before = await bodyText(page)
    expect(before).toContain('SAR 2,116.00')

    await page.getByRole('button', { name: /Remove/ }).first().click()
    const after = await bodyText(page)
    expect(after).not.toContain('SAR 2,116.00')
    await ctx.close()
  })

  test('payments screen loads', async ({ page }) => {
    await gotoReady(page, '/payments')
    const text = await bodyText(page)
    expect(text).toContain('Outstanding')
  })

  test('invoice preview renders', async ({ page }) => {
    await gotoReady(page, '/invoice-preview')
    const text = await bodyText(page)
    expect(text).toContain('Tax Invoice')
  })
})
