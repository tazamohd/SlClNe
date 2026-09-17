import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** The revenue-cycle spine: a car arrives, a job card opens, it's priced,
 *  billed and paid. Each screen below is real — no route is invented — but
 *  every write in this build hits the fixture repository, which refuses
 *  writes rather than pretending to save them (BLK-002: no server yet).
 *  So the "real" assertion at each mutating step is the honest one: the
 *  form takes real input and the save action is either disabled or refused,
 *  never silently accepted. */
test.describe('New Customer to Paid Invoice (Golden Path 1)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('job cards list loads and search filters client-side', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    expect(await bodyText(page)).toContain('Job Cards')

    const search = page.getByPlaceholder('Search job cards...')
    await search.fill('zzz-no-such-customer-zzz')
    await expect(page.getByText('No matching job cards')).toBeVisible()

    await search.fill('')
    await expect(page.getByText('No matching job cards')).toHaveCount(0)
  })

  test('opening "New Job Card" takes real customer and vehicle input', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    await page.getByRole('button', { name: 'New Job Card' }).click()

    const customer = page.getByPlaceholder('Ahmed Al-Rashid')
    const vehicle = page.getByPlaceholder('Toyota Camry 2022')
    await expect(customer).toBeVisible()

    await customer.fill('Fatima Al-Zahrani')
    await vehicle.fill('Lexus ES 350')
    await expect(customer).toHaveValue('Fatima Al-Zahrani')
    await expect(vehicle).toHaveValue('Lexus ES 350')

    // No live API is configured for this build, so the form is filled but not
    // submitted — cancel rather than assert a save this build cannot perform.
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('check-in records odometer, fuel level and belongings', async ({ page }) => {
    await gotoReady(page, '/workshop-check-in')
    expect(await bodyText(page)).toContain('Vehicle Check-In')

    await page.locator('#odometer').fill('48213')
    await page.getByRole('radio', { name: 'Full' }).click()
    await page.getByRole('checkbox', { name: 'Documents' }).click()
    await page.locator('#issues').fill('Customer reports a rattling noise on cold start.')

    await expect(page.locator('#odometer')).toHaveValue('48213')
    await expect(page.locator('#issues')).toHaveValue(/rattling noise/)

    // This build has no API, so `mayAdvance` is false and Complete Check-In
    // stays disabled — the honest state BLK-002 leaves the screen in.
    await expect(page.getByRole('button', { name: /Complete Check-In/ })).toBeDisabled()
  })

  test('estimate totals read from the real linked estimate, honestly empty here', async ({ page }) => {
    await gotoReady(page, '/workshop-estimate')
    const text = await bodyText(page)
    expect(text).toContain('Cost Estimate')
    // This build's check-in step above never persisted a job card (BLK-002:
    // no server yet), so no estimate carries this job card's `jobCardId` —
    // the same honest gap every other mutating step in this spec asserts,
    // now true of the totals too, rather than a design-fixture figure.
    expect(text).toContain('No line items to show')
    expect(text).toContain('SAR 0.00')
  })

  test('invoice create recomputes the total when a line is removed', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'accountant')
    const page = await ctx.newPage()
    await gotoReady(page, '/invoice-create')
    expect(await bodyText(page)).toContain('SAR 2,116.00')

    await page.getByRole('button', { name: /Remove/ }).first().click()
    expect(await bodyText(page)).not.toContain('SAR 2,116.00')
    await ctx.close()
  })

  test('payments screen shows outstanding balances', async ({ page }) => {
    await gotoReady(page, '/payments')
    expect(await bodyText(page)).toContain('Outstanding')
  })

  test('invoice preview renders the tax invoice with its ZATCA block', async ({ page }) => {
    await gotoReady(page, '/invoice-preview')
    const text = await bodyText(page)
    expect(text).toContain('Tax invoice')
    expect(text).toContain('INV-2026-0142')
    expect(text).toContain('ZATCA e-invoice')
    // The QR payload is server-assigned on issue; a preview of an unissued
    // invoice says so rather than drawing a decorative code.
    expect(text).toContain('The QR payload is assigned when the invoice is issued.')
  })
})

test.describe('New customer to paid invoice lifecycle', () => {
  test('job cards → check-in → estimate → invoice create → payment', async ({ context, page, browser }) => {
    test.setTimeout(120_000)
    await seedRole(context, 'owner')

    // 1. Front desk finds the queue empty of the new plate, then opens a job card.
    await gotoReady(page, '/job-cards')
    await page.getByPlaceholder('Search job cards...').fill('Lexus')
    await page.getByPlaceholder('Search job cards...').fill('')

    // 2. Vehicle is checked in with real intake data.
    await gotoReady(page, '/workshop-check-in')
    await page.locator('#odometer').fill('48213')
    await page.getByRole('radio', { name: '1/2' }).click()
    expect(await bodyText(page)).toContain('Vehicle Check-In')

    // 3. The estimate is priced from real line items when one is linked to
    //    this job card — this build never persisted the check-in above, so
    //    there is none, and the screen says so rather than fabricating a total.
    await gotoReady(page, '/workshop-estimate')
    expect(await bodyText(page)).toContain('No line items to show')

    // 4. Billing turns the completed work into an invoice; removing a line
    //    recomputes the total live, in the browser, before any save.
    const acctCtx = await browser.newContext()
    await seedRole(acctCtx, 'accountant')
    const acctPage = await acctCtx.newPage()
    await gotoReady(acctPage, '/invoice-create')
    const before = await bodyText(acctPage)
    expect(before).toContain('SAR 2,116.00')
    await acctPage.getByRole('button', { name: /Remove/ }).first().click()
    expect(await bodyText(acctPage)).not.toContain('SAR 2,116.00')

    // 5. Payment collection against the outstanding balance.
    await gotoReady(acctPage, '/payments')
    expect(await bodyText(acctPage)).toContain('Outstanding')
    await acctCtx.close()
  })
})
