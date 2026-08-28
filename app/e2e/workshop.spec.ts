import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Workshop flow', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('job cards list loads', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const text = await bodyText(page)
    expect(text).toContain('Job Cards')
  })

  test('job card detail loads with timeline', async ({ page }) => {
    await gotoReady(page, '/job-card-detail')
    const text = await bodyText(page)
    expect(text).toContain('JC-A3F8B2C1')
  })

  test('job detail loads with timeline', async ({ page }) => {
    await gotoReady(page, '/job-detail')
    const text = await bodyText(page)
    expect(text).toContain('Timeline')
  })

  test('workshop check-in renders', async ({ page }) => {
    await gotoReady(page, '/workshop-check-in')
    const text = await bodyText(page)
    expect(text).toContain('Vehicle Check-In')
  })

  test('workshop inspection renders', async ({ page }) => {
    await gotoReady(page, '/workshop-inspection')
    const text = await bodyText(page)
    expect(text).toContain('Vehicle Inspection')
  })

  test('workshop QC renders', async ({ page }) => {
    await gotoReady(page, '/workshop-qc')
    const text = await bodyText(page)
    expect(text).toContain('Quality Check')
  })

  test('workshop signature renders', async ({ page }) => {
    await gotoReady(page, '/workshop-signature')
    const text = await bodyText(page)
    expect(text).toContain('Customer Signature')
  })

  test('workshop delivery renders', async ({ page }) => {
    await gotoReady(page, '/workshop-delivery')
    const text = await bodyText(page)
    expect(text).toContain('Vehicle Delivery')
  })

  test('technician schedule loads', async ({ page }) => {
    await gotoReady(page, '/technician-schedule')
    const text = await bodyText(page)
    expect(text).toContain('Technician Schedule')
  })

  test('appointment calendar loads', async ({ page }) => {
    await gotoReady(page, '/appointment-calendar')
    const text = await bodyText(page)
    expect(text).toContain('Today')
  })

  test('technician cannot approve QC (segregation of duties)', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'technician')
    const page = await ctx.newPage()
    await gotoReady(page, '/workshop-qc')
    const approve = page.getByRole('button', { name: /Approve QC/ })
    await expect(approve).toBeDisabled()
    await ctx.close()
  })
})

test.describe('Workshop full lifecycle', () => {
  test('check-in → inspection → estimate → QC → signature → delivery', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/workshop-check-in')
    expect(await bodyText(page)).toContain('Vehicle Check-In')

    await gotoReady(page, '/workshop-inspection')
    expect(await bodyText(page)).toContain('Vehicle Inspection')

    await gotoReady(page, '/workshop-estimate')
    expect(await bodyText(page)).toContain('Cost Estimate')

    await gotoReady(page, '/workshop-qc')
    expect(await bodyText(page)).toContain('Quality Check')

    await gotoReady(page, '/workshop-signature')
    expect(await bodyText(page)).toContain('Customer Signature')

    await gotoReady(page, '/workshop-delivery')
    expect(await bodyText(page)).toContain('Vehicle Delivery')
  })
})
