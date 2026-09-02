import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

/** A customer books a service appointment from a phone. This is the one
 *  golden path that is genuinely a *form*: pick a vehicle, a service, a day
 *  and a time, each a real radio group with `aria-checked` state, and a step
 *  indicator that only advances as each choice is made — none of it is
 *  simulated. The booking is a real `POST /appointments`; without a live API
 *  (BLK-002) the confirm button stays disabled and the build says so up
 *  front, which is the honest end of this journey until the server exists. */
test.describe('Mobile Customer Booking (Golden Path 3)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'customer')
  })

  test('booking form loads with vehicle and service pickers', async ({ page }) => {
    await gotoReady(page, '/customer-portal/booking')
    await expect(page.getByRole('heading', { name: 'Book Appointment' })).toBeVisible()
    await expect(page.getByRole('radiogroup', { name: 'Select Vehicle' })).toBeVisible()
    await expect(page.getByRole('radiogroup', { name: 'Select Service' })).toBeVisible()
  })

  test('this build has no API configured, so booking is disabled', async ({ page }) => {
    await gotoReady(page, '/customer-portal/booking')
    await expect(page.getByText(/no API configured/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Confirm Booking/ })).toBeDisabled()
  })
})

test.describe('Mobile booking lifecycle', () => {
  test('pick vehicle → pick service → pick day and time → notes → confirm is honestly disabled', async ({
    context,
    page,
  }) => {
    test.setTimeout(90_000)
    await context.addInitScript(() => window.localStorage.setItem('salis-role', 'customer'))
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, '/customer-portal/booking')

    // Step 1: vehicle. No radio is checked yet.
    const vehicleGroup = page.getByRole('radiogroup', { name: 'Select Vehicle' })
    await expect(vehicleGroup.getByRole('radio', { checked: true })).toHaveCount(0)
    const firstVehicle = vehicleGroup.getByRole('radio').first()
    await firstVehicle.click()
    await expect(firstVehicle).toHaveAttribute('aria-checked', 'true')

    // Step 2: service. Picking a service is a real state change, not a link.
    const serviceGroup = page.getByRole('radiogroup', { name: 'Select Service' })
    const firstService = serviceGroup.getByRole('radio').first()
    await firstService.click()
    await expect(firstService).toHaveAttribute('aria-checked', 'true')

    // Step 3: day, then time. Changing the day resets the chosen time slot —
    // real dependent-field behaviour, not a static form.
    const dateGroup = page.getByRole('radiogroup', { name: 'Date & Time' })
    await dateGroup.getByRole('radio').nth(1).click()
    const timeGroup = page.getByRole('radiogroup', { name: 'Select Time' })
    const firstOpenSlot = timeGroup.locator('button:not([disabled])').first()
    await firstOpenSlot.click()
    await expect(firstOpenSlot).toHaveAttribute('aria-checked', 'true')

    // Step 4: notes — a real textarea, not decoration.
    await page.getByLabel('Notes').fill('Please check the AC — it is not cooling well.')
    await expect(page.getByLabel('Notes')).toHaveValue(/AC/)

    // Every step is now filled with real user input. The honest ending in this
    // build: no live API, so the booking cannot actually be persisted, and the
    // screen says so rather than pretending to confirm it.
    await expect(page.getByRole('button', { name: /Confirm Booking/ })).toBeDisabled()
    await expect(page.getByText(/no API configured/i)).toBeVisible()
  })
})
