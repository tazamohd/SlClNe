import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('CRM Lead Conversion (Golden Path 10)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('lead pipeline loads with open pipeline stats', async ({ page }) => {
    await gotoReady(page, '/lead-pipeline')
    const text = await bodyText(page)
    expect(text).toContain('Lead Pipeline')
    expect(text).toContain('Open Pipeline')
  })

  test('lead detail loads with contact and deal info', async ({ page }) => {
    await gotoReady(page, '/lead-detail')
    const text = await bodyText(page)
    expect(text).toContain('Tariq Al-Dosari')
    expect(text).toContain('Contact Information')
    expect(text).toContain('Deal Information')
    expect(text).toContain('Conversion Path')
  })

  test('opportunities page loads', async ({ page }) => {
    await gotoReady(page, '/opportunities')
    const text = await bodyText(page)
    expect(text).toContain('Opportunities')
  })

  test('campaigns page loads', async ({ page }) => {
    await gotoReady(page, '/campaigns')
    const text = await bodyText(page)
    expect(text).toContain('Marketing')
  })

  test('customer segments page loads', async ({ page }) => {
    await gotoReady(page, '/customer-segments')
    const text = await bodyText(page)
    expect(text).toContain('Customer Segments')
  })

  test('CRM tasks page loads', async ({ page }) => {
    await gotoReady(page, '/crmtasks')
    const text = await bodyText(page)
    expect(text).toContain('CRM Tasks')
  })

  test('customer feedback page takes a rating', async ({ page }) => {
    await gotoReady(page, '/customer-feedback')
    const text = await bodyText(page)
    expect(text).toContain('Service Feedback')
    expect(text).toContain('How was your experience?')
    const submit = page.getByRole('button', { name: 'Submit Feedback' })
    await expect(submit).toBeDisabled()
    await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '5 stars' }).click()
    await expect(submit).toBeEnabled()
  })
})

test.describe('CRM lead conversion lifecycle', () => {
  test('pipeline → lead detail → opportunities → campaigns → segments', async ({ context, page }) => {
    test.setTimeout(120_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/lead-pipeline')
    expect(await bodyText(page)).toContain('Open Pipeline')

    await gotoReady(page, '/lead-detail')
    expect(await bodyText(page)).toContain('Contact Information')

    await gotoReady(page, '/opportunities')
    expect(await bodyText(page)).toContain('Opportunities')

    await gotoReady(page, '/campaigns')
    expect(await bodyText(page)).toContain('Marketing')

    await gotoReady(page, '/customer-segments')
    expect(await bodyText(page)).toContain('Customer Segments')

    await gotoReady(page, '/crmtasks')
    expect(await bodyText(page)).toContain('CRM Tasks')
  })
})
