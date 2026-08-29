import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Customer Portal (Golden Path 19)', () => {
  test.describe('customer views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'customer')
    })

    test('customer portal dashboard loads', async ({ page }) => {
      await gotoReady(page, '/customer-portal')
      const text = await bodyText(page)
      expect(text).toContain('JC-A3F8B2C1')
    })

    test('customer portal booking page loads', async ({ page }) => {
      await gotoReady(page, '/customer-portal/booking')
      const text = await bodyText(page)
      expect(text).toContain('Book Appointment')
      expect(text).toContain('Select Vehicle')
    })

    test('customer app home loads with welcome and quick actions', async ({ page }) => {
      await gotoReady(page, '/customer-app/home')
      const text = await bodyText(page)
      expect(text).toContain('Welcome back')
      expect(text).toContain('My Vehicles')
    })

    test('customer app garage loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/garage')
      const text = await bodyText(page)
      expect(text).toContain('My Garage')
      expect(text).toContain('Add Vehicle')
    })

    test('customer app appointments loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/appointments')
      const text = await bodyText(page)
      expect(text).toContain('My Bookings')
      expect(text).toContain('Book Service')
    })

    test('customer app service tracking loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/service-tracking')
      const text = await bodyText(page)
      expect(text).toContain('Active Service')
      expect(text).toContain('Progress')
      expect(text).toContain('Vehicle Checked In')
    })

    test('customer app wallet loads with balance', async ({ page }) => {
      await gotoReady(page, '/customer-app/wallet')
      const text = await bodyText(page)
      expect(text).toContain('Balance')
      expect(text).toContain('SAR 850.00')
      expect(text).toContain('Transactions')
    })

    test('customer app orders loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/orders')
      const text = await bodyText(page)
      expect(text).toContain('My Orders')
      expect(text).toContain('ORD-0042')
    })

    test('customer app notifications loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/notifications')
      const text = await bodyText(page)
      expect(text).toContain('Notifications')
      expect(text).toContain('Service Update')
    })

    test('customer app profile loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/profile')
      const text = await bodyText(page)
      expect(text).toContain('Wallet')
      expect(text).toContain('My Orders')
      expect(text).toContain('Logout')
    })
  })

  test('customer approval page loads with estimate', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-approval')
    const text = await bodyText(page)
    expect(text).toContain('Customer Approval')
    expect(text).toContain('EST-2026-0418')
    await ctx.close()
  })
})

test.describe('Customer portal lifecycle', () => {
  test('portal → booking → service tracking → wallet → orders', async ({ context, page }) => {
    test.setTimeout(120_000)
    await seedRole(context, 'customer')

    await gotoReady(page, '/customer-portal')
    expect(await bodyText(page)).toContain('JC-A3F8B2C1')

    await gotoReady(page, '/customer-portal/booking')
    expect(await bodyText(page)).toContain('Book Appointment')

    await gotoReady(page, '/customer-app/home')
    expect(await bodyText(page)).toContain('Welcome back')

    await gotoReady(page, '/customer-app/service-tracking')
    expect(await bodyText(page)).toContain('Active Service')

    await gotoReady(page, '/customer-app/wallet')
    expect(await bodyText(page)).toContain('SAR 850.00')

    await gotoReady(page, '/customer-app/orders')
    expect(await bodyText(page)).toContain('ORD-0042')
  })
})
