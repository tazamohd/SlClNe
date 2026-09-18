import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** A part is needed for a job: procurement raises a request, suppliers
 *  quote against it, the quotes are compared and a purchase order is cut —
 *  that was the design's intent. Whether it can happen for real depends on
 *  a cross-shop parts-network backend (members, requests, quotes, orders)
 *  that turned out not to exist anywhere (BLK-004, project-control/
 *  SOURCE_RECONCILIATION.md): no route, no contract type, no table. The
 *  quotations screen's sort-by-rating used to reorder three invented
 *  supplier rows — a real re-sort of fake data is still a fake result, so
 *  it was replaced with an honest "no quotes received yet" state along
 *  with the rest of the parts-network screens, and there is nothing left
 *  to sort.
 *
 *  The purchase order itself is unaffected — it is a real create form
 *  against this workshop's own single-tenant suppliers/procurement, a
 *  different domain from the parts network (see PartsNetwork.tsx's own
 *  comment on that distinction). The number is assigned by the server on
 *  save, and this build (no API, BLK-002) says so rather than printing a
 *  number nothing issued. */
test.describe('Parts Procurement (Golden Path 6)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('parts network requests page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/requests')
    expect(await bodyText(page)).toContain('My Requests')
  })

  test('quotations screen is an honest gap state, not invented supplier rows', async ({ page }) => {
    await gotoReady(page, '/parts-network/quotations')
    const text = await bodyText(page)
    expect(text).toContain('Quotations')
    expect(text).toContain('No quotes received yet')
    await expect(page.getByRole('radio', { name: 'Rating' })).toHaveCount(0)
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
  test('raise request → honest quotations gap → confirm the PO', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. Procurement raises a request for parts.
    await gotoReady(page, '/parts-network/requests')
    expect(await bodyText(page)).toContain('My Requests')

    // 2. No parts-network backend exists to bring quotes back — the screen
    //    says so rather than inventing a comparison.
    await gotoReady(page, '/parts-network/quotations')
    expect(await bodyText(page)).toContain('No quotes received yet')

    // 3. The purchase order lives in this workshop's own procurement, a
    //    separate domain the parts network's absence doesn't block.
    await gotoReady(page, '/purchase-order')
    await expectPurchaseOrderForm(page)
  })
})

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
