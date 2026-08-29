import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Report Generation (Golden Path 18)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('reports hub loads', async ({ page }) => {
    await gotoReady(page, '/reports')
    const text = await bodyText(page)
    expect(text).toContain('Report Categories')
  })

  test('reports analytics page loads', async ({ page }) => {
    await gotoReady(page, '/reports-analytics')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('financial reports page loads', async ({ page }) => {
    await gotoReady(page, '/financial-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('executive reports page loads', async ({ page }) => {
    await gotoReady(page, '/executive-reports')
    const text = await bodyText(page)
    expect(text).toContain('SAR')
  })

  test('operational reports page loads', async ({ page }) => {
    await gotoReady(page, '/operational-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('workshop reports page loads', async ({ page }) => {
    await gotoReady(page, '/workshop-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('sales reports page loads', async ({ page }) => {
    await gotoReady(page, '/sales-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('inventory reports page loads', async ({ page }) => {
    await gotoReady(page, '/inventory-reports')
    const text = await bodyText(page)
    expect(text).toContain('Stock')
  })

  test('insurance reports page loads', async ({ page }) => {
    await gotoReady(page, '/insurance-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('loan reports page loads', async ({ page }) => {
    await gotoReady(page, '/loan-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('custom reports page loads', async ({ page }) => {
    await gotoReady(page, '/custom-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('BI dashboard page loads', async ({ page }) => {
    await gotoReady(page, '/bidashboard')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })
})

test.describe('Report generation lifecycle', () => {
  test('reports hub → financial → executive → inventory → BI dashboard', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/reports')
    expect(await bodyText(page)).toContain('Report Categories')

    await gotoReady(page, '/financial-reports')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    await gotoReady(page, '/executive-reports')
    expect(await bodyText(page)).toContain('SAR')

    await gotoReady(page, '/inventory-reports')
    expect(await bodyText(page)).toContain('Stock')

    await gotoReady(page, '/bidashboard')
    expect((await bodyText(page)).length).toBeGreaterThan(0)
  })
})
