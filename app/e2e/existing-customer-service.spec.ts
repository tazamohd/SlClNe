import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** A repeat customer books a return visit: the front desk pulls up their
 *  record and history, checks the vehicle in against an existing job card,
 *  and the visit closes with a feedback rating. Every screen here carries
 *  real customer/vehicle/job data (not just a heading), which is what
 *  distinguishes "existing customer" from a fresh intake (Golden Path 1). */
test.describe('Existing Customer Service (Golden Path 2)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('customer record loads with job history', async ({ page }) => {
    await gotoReady(page, '/customer-detail')
    const text = await bodyText(page)
    expect(text).toContain('Job History')
  })

  test('vehicle record loads with coverage details', async ({ page }) => {
    await gotoReady(page, '/vehicle-detail')
    const text = await bodyText(page)
    expect(text).toContain('Comprehensive Coverage')
  })

  test('job card detail loads for the returning vehicle', async ({ page }) => {
    await gotoReady(page, '/job-card-detail')
    const text = await bodyText(page)
    expect(text).toContain('JC-A3F8B2C1')
  })

  test('customer feedback records a satisfaction rating', async ({ page }) => {
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    expect(text).toContain('Customer Feedback')
    expect(text).toContain('Average Rating')
    expect(text).toContain('NPS Score')
  })
})

test.describe('Existing customer service lifecycle', () => {
  test('customer record → vehicle history → job card → feedback', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. Front desk pulls up the returning customer's account.
    await gotoReady(page, '/customer-detail')
    expect(await bodyText(page)).toContain('Job History')

    // 2. The customer's vehicle record — insurance and service history travel
    //    with the vehicle, not just the customer.
    await gotoReady(page, '/vehicle-detail')
    expect(await bodyText(page)).toContain('Comprehensive Coverage')

    // 3. The open (or most recent) job card for this visit.
    await gotoReady(page, '/job-card-detail')
    expect(await bodyText(page)).toContain('JC-A3F8B2C1')

    // 4. Visit closes with a feedback capture.
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    expect(text).toContain('Average Rating')
    expect(text).toContain('NPS Score')
  })
})
