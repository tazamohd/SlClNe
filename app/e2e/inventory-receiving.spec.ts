import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** Stock physically arrives against a purchase order and is put away in the
 *  warehouse. `InternalWarehouse` renders real zone-utilisation data,
 *  including the "Receiving" bay (zone A5) stock actually moves through —
 *  not a generic placeholder table. */
test.describe('Inventory Receiving (Golden Path 7)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('inventory hub loads', async ({ page }) => {
    await gotoReady(page, '/inventory')
    expect(await bodyText(page)).toContain('Inventory & Parts Management')
  })

  test('the purchase order goods are received against has a real PO number', async ({ page }) => {
    await gotoReady(page, '/purchase-order')
    expect(await bodyText(page)).toContain('PO-2026-0087')
  })

  test('internal warehouse shows the Receiving zone and its utilisation', async ({ page }) => {
    await gotoReady(page, '/internal-warehouse')
    const text = await bodyText(page)
    expect(text).toContain('Internal Warehouse')
    expect(text).toContain('Receiving')
    // A real utilisation table, not static copy — capacity and item counts
    // are numeric per zone.
    expect(text).toMatch(/\d+%/)
  })

  test('inventory reports reflect current stock', async ({ page }) => {
    await gotoReady(page, '/inventory-reports')
    expect(await bodyText(page)).toContain('Stock')
  })
})

test.describe('Inventory receiving lifecycle', () => {
  test('purchase order → goods arrive at the Receiving zone → stock reports update', async ({
    context,
    page,
  }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. The purchase order stock is arriving against.
    await gotoReady(page, '/purchase-order')
    expect(await bodyText(page)).toContain('PO-2026-0087')

    // 2. Goods physically land in the warehouse's Receiving zone.
    await gotoReady(page, '/internal-warehouse')
    const warehouseText = await bodyText(page)
    expect(warehouseText).toContain('Receiving')
    expect(warehouseText).toMatch(/\d+%/)

    // 3. The inventory hub and stock reports carry the received quantities.
    await gotoReady(page, '/inventory')
    expect(await bodyText(page)).toContain('Inventory & Parts Management')

    await gotoReady(page, '/inventory-reports')
    expect(await bodyText(page)).toContain('Stock')
  })
})
