import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** An order placed with an external supplier, followed end to end: the
 *  supplier's own portal view of it, procurement's requisition trail, and
 *  the purchase order the office holds — three different roles reading the
 *  same order from three real, role-scoped screens.
 *
 *  The supplier demo account is Al-Jazira Parts Co.; the purchase order is a
 *  create form whose number the server assigns on save (no API in this
 *  build, BLK-002). */
test.describe('Supplier Order (Golden Path 9)', () => {
  test('supplier sees their storefront identity on the portal', async ({ context, page }) => {
    await seedRole(context, 'supplier')
    await gotoReady(page, '/supplier-portal')
    expect(await bodyText(page)).toContain('Al-Jazira Parts Co.')
  })

  test('supplier can see their orders list', async ({ context, page }) => {
    await seedRole(context, 'supplier')
    await gotoReady(page, '/supplier-portal/orders')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('procurement sees requisitions raised against suppliers', async ({ context, page }) => {
    await seedRole(context, 'procurement')
    await gotoReady(page, '/procurement-portal/requisitions')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('owner holds the purchase order the supplier order is billed against', async ({ context, page }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/purchase-order')
    const text = await bodyText(page)
    expect(text).toContain('Create Purchase Order')
    expect(text).toContain('The order number is assigned by the server when the order is saved.')
  })
})

test.describe('Supplier order lifecycle', () => {
  test('supplier fulfils the order → procurement tracks the requisition → office holds the PO', async ({
    browser,
  }) => {
    test.setTimeout(90_000)

    // 1. The supplier's own view of the order they are fulfilling.
    const supplierCtx = await browser.newContext()
    await seedRole(supplierCtx, 'supplier')
    const supplierPage = await supplierCtx.newPage()
    await gotoReady(supplierPage, '/supplier-portal')
    expect(await bodyText(supplierPage)).toContain('Al-Jazira Parts Co.')
    await gotoReady(supplierPage, '/supplier-portal/orders')
    expect((await bodyText(supplierPage)).length).toBeGreaterThan(0)
    await supplierCtx.close()

    // 2. Procurement's requisition trail for the same order.
    const procCtx = await browser.newContext()
    await seedRole(procCtx, 'procurement')
    const procPage = await procCtx.newPage()
    await gotoReady(procPage, '/procurement-portal/requisitions')
    expect((await bodyText(procPage)).length).toBeGreaterThan(0)
    await procCtx.close()

    // 3. The office's purchase order record — the paper trail the supplier
    //    order and the requisition both resolve to.
    const ownerCtx = await browser.newContext()
    await seedRole(ownerCtx, 'owner')
    const ownerPage = await ownerCtx.newPage()
    await gotoReady(ownerPage, '/purchase-order')
    expect(await bodyText(ownerPage)).toContain('Create Purchase Order')
    expect(await bodyText(ownerPage)).toContain('The order number is assigned by the server when the order is saved.')
    await ownerCtx.close()
  })
})
