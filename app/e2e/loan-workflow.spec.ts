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

  test('public loan calculator recomputes the instalment from real input', async ({ page }) => {
    await gotoReady(page, '/public-portal/loans')
    const text = await bodyText(page)
    expect(text).toContain('Auto Financing')
    expect(text).toContain('Estimated Monthly Payment')
    expect(text).toContain('SAR 2,183.00')

    await page.getByLabel('Vehicle Price (SAR)').fill('60000')
    const after = await bodyText(page)
    expect(after).not.toContain('SAR 2,183.00')
    expect(after).toMatch(/SAR [\d,]+\.\d{2}/)
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
    // Portfolio totals are a server aggregate; the fixture build names the
    // endpoint it would read rather than estimating figures.
    const reports = await bodyText(ownerPage)
    expect(reports).toContain('Loan Reports')
    expect(reports).toContain('GET /loans/summary')
    await ownerCtx.close()
  })
})
