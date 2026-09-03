import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText, onMobile } from './helpers'

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

  test('customer detail page loads with the account and its service history', async ({ page }) => {
    await gotoReady(page, '/customer-detail')
    const text = await bodyText(page)
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Toyota Camry 2022')
    // The phone layout keeps the account summary and vehicle cards; the
    // service history table is a desktop section.
    if (!onMobile(test.info())) expect(text).toContain('Service History')
  })

  test('vehicles list loads', async ({ page }) => {
    await gotoReady(page, '/vehicles')
    const text = await bodyText(page)
    expect(text).toContain('All Vehicles')
  })

  test('vehicle detail page loads', async ({ page }) => {
    await gotoReady(page, '/vehicle-detail')
    const text = await bodyText(page)
    expect(text).toContain('RUH 4821')
    expect(text).toContain('Latest Job Cards')
  })
})
