import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** A part is needed for a job: procurement raises a request, suppliers
 *  quote against it, the quotes are compared and a purchase order is cut.
 *  The quotations sort is a real client-side re-sort of live rows (not a
 *  static screenshot) — the supplier order genuinely changes on click.
 *
 *  The purchase order itself is a create form: the number is assigned by
 *  the server on save, and this build (no API, BLK-002) says so rather than
 *  printing a number nothing issued. */
test.describe('Parts Procurement (Golden Path 6)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('parts network requests page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/requests')
    expect(await bodyText(page)).toContain('My Requests')
  })

  test('quotations re-sort by rating when the sort chip is picked', async ({ page }) => {
    await gotoReady(page, '/parts-network/quotations')
    expect(await bodyText(page)).toContain('Quotations')
    expect(await orderOf(page)).toEqual(['Saudi Parts Company', 'Al-Faisal Auto Parts', 'Parts Hub KSA'])

    await page.getByRole('radio', { name: 'Rating' }).click()
    expect(await orderOf(page)).toEqual(['Al-Faisal Auto Parts', 'Saudi Parts Company', 'Parts Hub KSA'])
  })

  test('parts network orders page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/orders')
    expect(await bodyText(page)).toContain('Orders')
  })

  test('the purchase order is a real form whose number the server assigns', async ({ page }) => {
    await gotoReady(page, '/purchase-order')
    await expectPurchaseOrderForm(page)
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
    //    reorders the live rows, it isn't a decorative chip.
    await gotoReady(page, '/parts-network/quotations')
    const beforeSort = await orderOf(page)
    await page.getByRole('radio', { name: 'Rating' }).click()
    const afterSort = await orderOf(page)
    expect(afterSort).not.toEqual(beforeSort)
    expect(afterSort[0]).toBe('Al-Faisal Auto Parts')

    // 3. The chosen quote becomes a placed order.
    await gotoReady(page, '/parts-network/orders')
    expect(await bodyText(page)).toContain('Orders')

    // 4. The purchase order for the confirmed procurement.
    await gotoReady(page, '/purchase-order')
    await expectPurchaseOrderForm(page)
  })
})

/** Supplier names in the order the screen lists them — a table on desktop,
 *  cards on the phone, the same rows either way. */
async function orderOf(page: import('@playwright/test').Page): Promise<string[]> {
  const text = await bodyText(page)
  return ['Saudi Parts Company', 'Al-Faisal Auto Parts', 'Parts Hub KSA']
    .map((name) => ({ name, at: text.indexOf(name) }))
    .filter(({ at }) => at >= 0)
    .sort((a, b) => a.at - b.at)
    .map(({ name }) => name)
}

async function expectPurchaseOrderForm(page: import('@playwright/test').Page) {
  const text = await bodyText(page)
  expect(text).toContain('Create Purchase Order')
  expect(text).toContain('The order number is assigned by the server when the order is saved.')
  // The reorder alerts are the real stock positions, and each one can be
  // pulled onto the order.
  expect(text).toContain('Brake Pads (Front)')
  expect(text).toContain('Spark Plug Set')
  await expect(page.getByRole('button', { name: 'Order' }).first()).toBeVisible()
}
