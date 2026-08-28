import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Estimates', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('estimates list loads', async ({ page }) => {
    await gotoReady(page, '/estimates')
    const text = await bodyText(page)
    expect(text).toContain('Estimates')
  })

  test('estimate detail loads with reference number', async ({ page }) => {
    await gotoReady(page, '/estimate-detail')
    const text = await bodyText(page)
    expect(text).toContain('EST-0231')
  })

  test('workshop estimate shows computed totals', async ({ page }) => {
    await gotoReady(page, '/workshop-estimate')
    const text = await bodyText(page)
    expect(text).toContain('SAR 1,345.00')
    expect(text).toContain('SAR 201.75')
    expect(text).toContain('SAR 1,546.75')
  })

  test('customer approval page loads', async ({ page }) => {
    await gotoReady(page, '/customer-approval')
    const text = await bodyText(page)
    expect(text).toContain('Customer Approval')
  })

  test('approval inbox loads', async ({ page }) => {
    await gotoReady(page, '/approval-inbox')
    const text = await bodyText(page)
    expect(text).toContain('Approval Inbox')
  })
})
