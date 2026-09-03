import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Insurance Claim (Golden Path 11)', () => {
  test.describe('owner views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'owner')
    })

    test('insurance claims page loads, and says what it is missing', async ({ page }) => {
      await gotoReady(page, '/insurance-claims')
      const text = await bodyText(page)
      expect(text).toContain('Insurance & Finance')
      expect(text).toContain('Claims')
      // Claims live on the server and a decision cannot be faked: the fixture
      // build shows the empty state and names the missing collection.
      expect(text).toContain('No claims to show')
      expect(text).toContain('insuranceClaims')
    })

    test('insurance reports page loads', async ({ page }) => {
      await gotoReady(page, '/insurance-reports')
      const text = await bodyText(page)
      expect(text).toContain('Insurance Reports')
    })
  })

  test('customer sees insurance in their app', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-app/insurance')
    const text = await bodyText(page)
    expect(text).toContain('Insurance')
    await ctx.close()
  })

  test('public insurance info page loads', async ({ page }) => {
    await gotoReady(page, '/public-portal/insurance')
    const text = await bodyText(page)
    expect(text).toContain('Vehicle Insurance')
  })
})

test.describe('Insurance claim lifecycle', () => {
  test('owner views claims → reports → customer sees insurance', async ({ context, page, browser }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/insurance-claims')
    expect(await bodyText(page)).toContain('Insurance & Finance')
    expect(await bodyText(page)).toContain('No claims to show')

    await gotoReady(page, '/insurance-reports')
    expect(await bodyText(page)).toContain('Insurance Reports')

    // Switch to customer role
    const customerCtx = await browser.newContext()
    await seedRole(customerCtx, 'customer')
    const customerPage = await customerCtx.newPage()
    await gotoReady(customerPage, '/customer-app/insurance')
    expect(await bodyText(customerPage)).toContain('Insurance')
    await customerCtx.close()
  })
})
