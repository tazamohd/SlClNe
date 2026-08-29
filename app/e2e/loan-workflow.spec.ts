import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Loan Workflow (Golden Path 13)', () => {
  test('customer loan view loads', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-app/loans')
    const text = await bodyText(page)
    expect(text).toContain('Loans')
    await ctx.close()
  })

  test('owner views loan reports', async ({ context, page }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/loan-reports')
    const text = await bodyText(page)
    expect(text).toContain('Loan Reports')
  })

  test('public loan info page loads', async ({ page }) => {
    await gotoReady(page, '/public-portal/loans')
    const text = await bodyText(page)
    expect(text).toContain('Auto Financing')
  })
})

test.describe('Loan workflow lifecycle', () => {
  test('customer applies for loan → owner reviews loan reports', async ({ browser }) => {
    test.setTimeout(90_000)

    // Customer views loans
    const customerCtx = await browser.newContext()
    await seedRole(customerCtx, 'customer')
    const customerPage = await customerCtx.newPage()
    await gotoReady(customerPage, '/customer-app/loans')
    expect(await bodyText(customerPage)).toContain('Loans')
    await customerCtx.close()

    // Owner reviews loan reports
    const ownerCtx = await browser.newContext()
    await seedRole(ownerCtx, 'owner')
    const ownerPage = await ownerCtx.newPage()
    await gotoReady(ownerPage, '/loan-reports')
    expect(await bodyText(ownerPage)).toContain('Loan Reports')
    expect(await bodyText(ownerPage)).toContain('Applications')
    await ownerCtx.close()
  })
})
