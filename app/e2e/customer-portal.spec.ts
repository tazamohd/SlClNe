import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Customer Portal (Golden Path 19)', () => {
  test.describe('customer views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'customer')
    })

    test('customer portal dashboard loads with the active job and the garage', async ({ page }) => {
      await gotoReady(page, '/customer-portal')
      const text = await bodyText(page)
      /* The demo customer is Ahmed Al-Rashid, and the active job below is his:
       * `A3F8B2C1` is the Toyota Camry the design's board has in the workshop.
       * They agree on purpose — the login used to be a Khalid who matched no
       * `customers` row, so the portal greeted one person and showed another's
       * car. */
      expect(text).toContain('Ahmed Al-Rashid')
      expect(text).toContain('Active Service')
      expect(text).toContain('A3F8B2C1')
      expect(text).toContain('My Vehicles')
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

    /* "Add Vehicle" is deliberately gone: `vehicles` grants `customer` `v` and
     * no create, so the button could only ever navigate to the route it was
     * already on — which is exactly what it did. The screen now names who
     * registers a vehicle instead, and this asserts that sentence rather than
     * the label of a control that did nothing. */
    test('customer app garage loads and says who registers a vehicle', async ({ page }) => {
      await gotoReady(page, '/customer-app/garage')
      const text = await bodyText(page)
      expect(text).toContain('My Garage')
      expect(text).toContain('Vehicles are registered by the workshop')
      await expect(page.getByRole('button', { name: 'Add Vehicle' })).toHaveCount(0)
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
      /* The timeline is wired to the real job stage (BLK-004): it renders
       * all six real workshop stages from WorkflowStepper.ts, not the old
       * fixture's invented "Vehicle Checked In" wording. "Check-In" is
       * always present as the first rail step regardless of which stage
       * the seeded active job is actually on. */
      expect(text).toContain('Check-In')
    })

    test('customer app wallet has no data source yet', async ({ page }) => {
      await gotoReady(page, '/customer-app/wallet')
      const text = await bodyText(page)
      /* No wallet/balance/ledger backend exists (BLK-004): the previous
       * three invented transactions and their summed "SAR 850.00" balance
       * are gone, replaced with an honest gap state. */
      expect(text).toContain('Wallet')
      expect(text).toContain('Wallet not available yet')
    })

    test('customer app orders has no data source yet', async ({ page }) => {
      await gotoReady(page, '/customer-app/orders')
      const text = await bodyText(page)
      expect(text).toContain('My Orders')
      /* No order/catalog backend exists (BLK-004): the previous invented
       * "ORD-0042" row is gone, replaced with an honest gap state. */
      expect(text).toContain('Order history not available yet')
    })

    test('customer app notifications has no data source yet', async ({ page }) => {
      await gotoReady(page, '/customer-app/notifications')
      const text = await bodyText(page)
      expect(text).toContain('Notifications')
      /* No notification feed/delivery backend exists (BLK-004): the
       * previous invented "Service Update" row is gone, replaced with an
       * honest gap state. */
      expect(text).toContain('Notifications not available yet')
    })

    test('customer app profile loads', async ({ page }) => {
      await gotoReady(page, '/customer-app/profile')
      const text = await bodyText(page)
      expect(text).toContain('Wallet')
      expect(text).toContain('My Orders')
      expect(text).toContain('Logout')
    })
  })

  test('customer approval page loads with real approval lines', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-approval')
    const text = await bodyText(page)
    expect(text).toContain('What we found')
    expect(text).toContain('Authorise the work')
    await ctx.close()
  })
})

test.describe('Customer portal lifecycle', () => {
  test('portal → booking → service tracking → wallet → orders', async ({ context, page }) => {
    test.setTimeout(120_000)
    await seedRole(context, 'customer')

    await gotoReady(page, '/customer-portal')
    expect(await bodyText(page)).toContain('A3F8B2C1')

    await gotoReady(page, '/customer-portal/booking')
    expect(await bodyText(page)).toContain('Book Appointment')

    await gotoReady(page, '/customer-app/home')
    expect(await bodyText(page)).toContain('Welcome back')

    await gotoReady(page, '/customer-app/service-tracking')
    expect(await bodyText(page)).toContain('Active Service')

    // No wallet/order backend exists (BLK-004) — the honest gap state, not
    // the old fixture's invented balance and order number.
    await gotoReady(page, '/customer-app/wallet')
    expect(await bodyText(page)).toContain('Wallet not available yet')

    await gotoReady(page, '/customer-app/orders')
    expect(await bodyText(page)).toContain('Order history not available yet')
  })
})
