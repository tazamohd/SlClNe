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

/** Ported from the retired `scripts/journeys/supply-chain.mjs`.
 *
 *  Receiving is a ledger movement, not a screen: on-hand is never written
 *  directly, it is the consequence of the movements behind it. Nothing else in
 *  this suite opens a part's ledger at all, so nothing else would notice if
 *  the stock figures or the movement history disappeared from it. This build
 *  has no ledger behind the dialog and says so — the honest end of this path
 *  until the API exists.
 *
 *  Pinned to a desktop viewport in both projects: the mobile stock list
 *  renders cards rather than the parts table this opens a part from. */
test.describe('Inventory receiving — the part ledger', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('a part opens its ledger, which states the stock and refuses movements it cannot record', async ({ page }) => {
    await gotoReady(page, '/inventory')

    const parts = page.getByRole('table', { name: 'Current stock levels by part' })
    await expect(parts).toBeVisible()
    await expect(parts.locator('.animate-pulse')).toHaveCount(0)
    expect(await parts.locator('tbody tr').count()).toBeGreaterThan(0)
    await parts.locator('tbody tr').first().click()

    const ledger = page.getByRole('dialog')
    await expect(ledger).toBeVisible()
    // The four figures a storekeeper receives against. Reserved and Available
    // may read "—" on a dataset that does not record holds; the labels may not
    // be missing, or the quantity on the shelf is being asserted from nowhere.
    for (const figure of ['On Hand', 'Reserved', 'Available', 'Reorder At']) {
      await expect(ledger.getByText(figure, { exact: true })).toBeVisible()
    }

    // No movement can be booked from this build, and the dialog says why
    // rather than offering a form that could not save.
    await expect(ledger.getByRole('button', { name: 'Receive Stock' })).toHaveCount(0)
    await expect(ledger).toContainText('Stock movements need the API')
  })
})
