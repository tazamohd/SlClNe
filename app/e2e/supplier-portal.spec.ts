import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Supplier Portal (Golden Path 21)', () => {
  test.describe('supplier views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'supplier')
    })

    test('supplier portal loads', async ({ page }) => {
      await gotoReady(page, '/supplier-portal')
      const text = await bodyText(page)
      expect(text).toContain('AutoParts KSA')
    })

    test('supplier orders page loads', async ({ page }) => {
      await gotoReady(page, '/supplier-portal/orders')
      const text = await bodyText(page)
      expect(text.length).toBeGreaterThan(0)
    })
  })

  test.describe('procurement views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'procurement')
    })

    test('procurement portal loads', async ({ page }) => {
      await gotoReady(page, '/procurement-portal')
      const text = await bodyText(page)
      expect(text.length).toBeGreaterThan(0)
    })

    test('procurement requisitions page loads', async ({ page }) => {
      await gotoReady(page, '/procurement-portal/requisitions')
      const text = await bodyText(page)
      expect(text.length).toBeGreaterThan(0)
    })
  })

  test.describe('owner views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'owner')
    })

    test('purchase order page loads', async ({ page }) => {
      await gotoReady(page, '/purchase-order')
      const text = await bodyText(page)
      expect(text).toContain('PO-2026-0087')
    })

    test('parts network page loads', async ({ page }) => {
      await gotoReady(page, '/parts-network')
      const text = await bodyText(page)
      expect(text).toContain('Parts Network')
    })

    test('parts network requests page loads', async ({ page }) => {
      await gotoReady(page, '/parts-network/requests')
      const text = await bodyText(page)
      expect(text).toContain('My Requests')
    })

    test('parts network quotations page loads', async ({ page }) => {
      await gotoReady(page, '/parts-network/quotations')
      const text = await bodyText(page)
      expect(text).toContain('Quotations')
    })

    test('parts network orders page loads', async ({ page }) => {
      await gotoReady(page, '/parts-network/orders')
      const text = await bodyText(page)
      expect(text).toContain('Orders')
    })
  })
})

test.describe('Supplier portal lifecycle', () => {
  test('supplier portal → procurement → purchase orders → parts network', async ({ browser }) => {
    test.setTimeout(90_000)

    // Supplier views portal and orders
    const supplierCtx = await browser.newContext()
    await seedRole(supplierCtx, 'supplier')
    const supplierPage = await supplierCtx.newPage()

    await gotoReady(supplierPage, '/supplier-portal')
    expect(await bodyText(supplierPage)).toContain('AutoParts KSA')

    await gotoReady(supplierPage, '/supplier-portal/orders')
    expect((await bodyText(supplierPage)).length).toBeGreaterThan(0)

    await supplierCtx.close()

    // Procurement reviews requisitions
    const procCtx = await browser.newContext()
    await seedRole(procCtx, 'procurement')
    const procPage = await procCtx.newPage()

    await gotoReady(procPage, '/procurement-portal')
    expect((await bodyText(procPage)).length).toBeGreaterThan(0)

    await gotoReady(procPage, '/procurement-portal/requisitions')
    expect((await bodyText(procPage)).length).toBeGreaterThan(0)

    await procCtx.close()

    // Owner checks parts network
    const ownerCtx = await browser.newContext()
    await seedRole(ownerCtx, 'owner')
    const ownerPage = await ownerCtx.newPage()

    await gotoReady(ownerPage, '/purchase-order')
    expect(await bodyText(ownerPage)).toContain('PO-2026-0087')

    await gotoReady(ownerPage, '/parts-network')
    expect(await bodyText(ownerPage)).toContain('Parts Network')

    await ownerCtx.close()
  })
})
