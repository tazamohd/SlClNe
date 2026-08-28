import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Inventory and parts', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('inventory page loads', async ({ page }) => {
    await gotoReady(page, '/inventory')
    const text = await bodyText(page)
    expect(text).toContain('Inventory & Parts Management')
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

    const firstBefore = await page.locator('tbody tr').first().innerText()
    await page.getByRole('tab', { name: /Rating/ }).click()
    const firstAfter = await page.locator('tbody tr').first().innerText()
    expect(firstBefore).not.toBe(firstAfter)
  })

  test('parts network orders loads', async ({ page }) => {
    await gotoReady(page, '/parts-network/orders')
    const text = await bodyText(page)
    expect(text).toContain('Orders')
  })

  test('purchase order detail loads', async ({ page }) => {
    await gotoReady(page, '/purchase-order')
    const text = await bodyText(page)
    expect(text).toContain('PO-2026-0087')
  })

  test('inventory reports loads', async ({ page }) => {
    await gotoReady(page, '/inventory-reports')
    const text = await bodyText(page)
    expect(text).toContain('Stock reports')
  })
})
