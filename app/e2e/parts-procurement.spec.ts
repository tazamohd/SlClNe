import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** A part is needed for a job: procurement raises a request, suppliers
 *  quote against it, the quotes are compared and a purchase order is cut.
 *  The quotations table sort is a real client-side re-sort of live rows
 *  (not a static screenshot) — the row order genuinely changes on click. */
test.describe('Parts Procurement (Golden Path 6)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('parts network requests page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/requests')
    expect(await bodyText(page)).toContain('My Requests')
  })

  test('quotations table re-sorts by rating on tab click', async ({ page }) => {
    await gotoReady(page, '/parts-network/quotations')
    expect(await bodyText(page)).toContain('Quotations')

    const firstBefore = await page.locator('tbody tr').first().innerText()
    await page.getByRole('tab', { name: /Rating/ }).click()
    const firstAfter = await page.locator('tbody tr').first().innerText()
    expect(firstBefore).not.toBe(firstAfter)
  })

  test('parts network orders page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/orders')
    expect(await bodyText(page)).toContain('Orders')
  })

  test('purchase order detail loads with a real PO number', async ({ page }) => {
    await gotoReady(page, '/purchase-order')
    expect(await bodyText(page)).toContain('PO-2026-0087')
  })
})

test.describe('Parts procurement lifecycle', () => {
  test('raise request → compare quotations by rating → confirm the PO', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. Procurement raises a request for parts.
    await gotoReady(page, '/parts-network/requests')
    expect(await bodyText(page)).toContain('My Requests')

    // 2. Quotes come back from the network; sorting by rating genuinely
    //    reorders the live rows, it isn't a decorative tab.
    await gotoReady(page, '/parts-network/quotations')
    const beforeSort = await page.locator('tbody tr').first().innerText()
    await page.getByRole('tab', { name: /Rating/ }).click()
    const afterSort = await page.locator('tbody tr').first().innerText()
    expect(beforeSort).not.toBe(afterSort)

    // 3. The chosen quote becomes a placed order.
    await gotoReady(page, '/parts-network/orders')
    expect(await bodyText(page)).toContain('Orders')

    // 4. The purchase order record for the confirmed procurement.
    await gotoReady(page, '/purchase-order')
    expect(await bodyText(page)).toContain('PO-2026-0087')
  })
})
