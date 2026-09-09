import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText, onMobile } from './helpers'

/** A repeat customer books a return visit: the front desk pulls up their
 *  record and history, checks the vehicle in against an existing job card,
 *  and the visit closes with a feedback rating. Every screen here carries
 *  real customer/vehicle/job data (not just a heading), which is what
 *  distinguishes "existing customer" from a fresh intake (Golden Path 1).
 *
 *  The record screens are data-backed: the same customer, vehicle and job
 *  card (`A3F8B2C1`) travel through every step, so each assertion names the
 *  identifiers the step before it showed. */
test.describe('Existing Customer Service (Golden Path 2)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('customer record loads with the vehicles and history on the account', async ({ page }) => {
    await gotoReady(page, '/customer-detail')
    const text = await bodyText(page)
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Toyota Camry 2022')
    expect(text).toContain('Total Spent')
    if (!onMobile(test.info())) {
      // The desktop record carries the service history table; the phone
      // layout keeps the account summary and vehicle cards.
      expect(text).toContain('Service History')
      expect(text).toContain('A3F8B2C1')
    }
  })

  test('vehicle record loads with the plate, the owner and its latest job card', async ({ page }) => {
    await gotoReady(page, '/vehicle-detail')
    const text = await bodyText(page)
    expect(text).toContain('RUH 4821')
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Latest Job Cards')
    expect(text).toContain('A3F8B2C1')
  })

  test('job card detail loads for the returning vehicle', async ({ page }) => {
    await gotoReady(page, '/job-card-detail')
    const text = await bodyText(page)
    expect(text).toContain('A3F8B2C1')
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Toyota Camry 2022')
    // The real six-stage rail, not a status word.
    expect(text).toContain('Quality Check')
    expect(text).toContain('Delivery')
  })

  test('customer feedback takes a real rating and refuses to submit without one', async ({ page }) => {
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    expect(text).toContain('Service Feedback')
    expect(text).toContain('How was your experience?')
    expect(text).toContain('Rate the Details')

    const submit = page.getByRole('button', { name: 'Submit Feedback' })
    await expect(submit).toBeDisabled()
    expect(text).toContain('Choose an overall rating to submit.')

    // Picking an overall rating is what unlocks the submit control.
    await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '5 stars' }).click()
    await expect(submit).toBeEnabled()
  })
})

test.describe('Existing customer service lifecycle', () => {
  test('customer record → vehicle history → job card → feedback', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. Front desk pulls up the returning customer's account.
    await gotoReady(page, '/customer-detail')
    let text = await bodyText(page)
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Toyota Camry 2022')

    // 2. The customer's vehicle record — the job history travels with the
    //    vehicle, not just the customer.
    await gotoReady(page, '/vehicle-detail')
    text = await bodyText(page)
    expect(text).toContain('RUH 4821')
    expect(text).toContain('A3F8B2C1')

    // 3. The open job card for this visit.
    await gotoReady(page, '/job-card-detail')
    text = await bodyText(page)
    expect(text).toContain('A3F8B2C1')
    expect(text).toContain('Ahmed Al-Rashid')

    // 4. Visit closes with a feedback capture: a rating has to be chosen
    //    before anything can be submitted.
    await gotoReady(page, '/customer-feedback')
    const submit = page.getByRole('button', { name: 'Submit Feedback' })
    await expect(submit).toBeDisabled()
    await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '4 stars' }).click()
    await expect(submit).toBeEnabled()
  })
})
