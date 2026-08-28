import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Customer registry', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('customers list loads with customer data', async ({ page }) => {
    await gotoReady(page, '/customers')
    const text = await bodyText(page)
    expect(text).toContain('Customers')
  })

  test('customers list is not blank', async ({ page }) => {
    await gotoReady(page, '/customers')
    const text = await bodyText(page)
    expect(text.trim().length).toBeGreaterThan(50)
  })

  test('customer detail page loads with job history', async ({ page }) => {
    await gotoReady(page, '/customer-detail')
    const text = await bodyText(page)
    expect(text).toContain('Job History')
  })

  test('vehicles list loads', async ({ page }) => {
    await gotoReady(page, '/vehicles')
    const text = await bodyText(page)
    expect(text).toContain('All Vehicles')
  })

  test('vehicle detail page loads', async ({ page }) => {
    await gotoReady(page, '/vehicle-detail')
    const text = await bodyText(page)
    expect(text).toContain('Comprehensive Coverage')
  })
})
