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

  test('customer record loads with the customer on it', async ({ page }, testInfo) => {
    await gotoReady(page, '/customer-detail')
    const text = await bodyText(page)

    // The record is only useful if it carries the customer, not just a heading.
    // True at every width.
    expect(text).toContain('Ahmed Al-Rashid')
    expect(text).toContain('Toyota Camry 2022')

    // The service-history table is a desktop composition. CustomerDetail.dc.html
    // calls it "Service History" — the spec used to assert "Job History", which
    // appears nowhere in the design bundle or the source, so it could never have
    // passed. The mobile design answers the same question with a different
    // shape: vehicle count, total spent, last visit. Asserting the desktop
    // heading at 390px was failing the app for rendering its own design.
    if (testInfo.project.name === 'mobile') {
      expect(text).toContain('Last Visit')
    } else {
      expect(text).toContain('Service History')
    }
  })

  test('vehicle record loads with its identity and service record', async ({ page }) => {
    await gotoReady(page, '/vehicle-detail')
    const text = await bodyText(page)
    // "Comprehensive Coverage" was asserted here for months. It is copy from
    // CustomerApp.Insurance — VehicleDetail.dc.html has no coverage section at
    // all. What the design does carry is the vehicle's identity and what has
    // been done to it, so that is what this checks.
    expect(text).toContain('Toyota Camry 2022')
    expect(text).toContain('RUH 4821')
    expect(text).toContain('Ahmed Al-Rashid')
  })

  test('job card detail loads for the returning vehicle', async ({ page }) => {
    await gotoReady(page, '/job-card-detail')
    const text = await bodyText(page)
    expect(text).toContain('JC-A3F8B2C1')
  })

  test('customer feedback offers the rating capture the design specifies', async ({ page }) => {
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    // This route is the capture form a customer fills in — "How was your
    // experience?" — which is what CustomerFeedback.dc.html shows. The
    // "Average Rating" / "NPS Score" rollup this used to assert is the mobile
    // design's summary, so the assertion failed on desktop every run.
    expect(text).toContain('Service Feedback')
    expect(text).toContain('How was your experience?')
    expect(text).toContain('Work Quality')
  })
})

test.describe('Existing customer service lifecycle', () => {
  test('customer record → vehicle history → job card → feedback', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. Front desk pulls up the returning customer's account. Assert the
    //    customer rather than a section heading, so the walk holds at both
    //    widths — the two designs compose this screen differently.
    await gotoReady(page, '/customer-detail')
    expect(await bodyText(page)).toContain('Ahmed Al-Rashid')

    // 2. The customer's vehicle record — the service record travels with the
    //    vehicle, not just the customer.
    await gotoReady(page, '/vehicle-detail')
    expect(await bodyText(page)).toContain('RUH 4821')

    // 3. The open (or most recent) job card for this visit.
    await gotoReady(page, '/job-card-detail')
    expect(await bodyText(page)).toContain('JC-A3F8B2C1')

    // 4. Visit closes with a feedback capture — the form the customer fills
    //    in, which is what this route renders on both projects.
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    expect(text).toContain('Service Feedback')
    expect(text).toContain('How was your experience?')
  })
})
