import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Inventory and parts', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('inventory page loads', async ({ page }) => {
    await gotoReady(page, '/inventory')
    const text = await bodyText(page)
    expect(text).toContain('Inventory & Parts')
  })

  test('parts network dashboard loads', async ({ page }) => {
    await gotoReady(page, '/parts-network')
    const text = await bodyText(page)
    expect(text).toContain('Parts Network')
  })

  test('parts network requests page loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/requests')
    const text = await bodyText(page)
    expect(text).toContain('My Requests')
  })

  test('parts network quotations loads and sorting works', async ({ page }) => {
    await gotoReady(page, '/parts-network/quotations')
    const text = await bodyText(page)
    expect(text).toContain('Quotations')

    // Best price leads by default; the sort chips are a radio group and
    // picking Rating puts the 4.8-rated supplier first — a table on desktop,
    // cards on the phone, the same rows either way.
    const before = await bodyText(page)
    expect(before.indexOf('Saudi Parts Company')).toBeLessThan(before.indexOf('Al-Faisal Auto Parts'))
    await page.getByRole('radio', { name: 'Rating' }).click()
    const after = await bodyText(page)
    expect(after.indexOf('Al-Faisal Auto Parts')).toBeLessThan(after.indexOf('Saudi Parts Company'))
  })

  test('parts network orders loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/orders')
    const text = await bodyText(page)
    expect(text).toContain('Orders')
  })

  test('purchase order detail loads', async ({ page }) => {
    await gotoReady(page, '/purchase-order')
    const text = await bodyText(page)
    expect(text).toContain('Create Purchase Order')
    expect(text).toContain('The order number is assigned by the server when the order is saved.')
  })

  test('inventory reports loads', async ({ page }) => {
    await gotoReady(page, '/inventory-reports')
    const text = await bodyText(page)
    expect(text).toContain('Inventory Reports')
    expect(text).toContain('Stock Value')
  })
})
